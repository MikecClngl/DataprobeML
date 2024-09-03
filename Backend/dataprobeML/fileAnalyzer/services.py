import sacrebleu
import pandas as pd
import ast
from difflib import SequenceMatcher

#Functions for calculate BLEU score
def calculate_bleu_score(reference_texts, candidate_text):
    score = sacrebleu.sentence_bleu(candidate_text, reference_texts)
    return score.score

def calculate_bleu_from_csv(file_path, candidate_column, reference_column):
    df = pd.read_csv(file_path)
    references = []
    candidates = []

    reference_column = reference_column.strip()
    candidate_column = candidate_column.strip()

    for _, row in df.iterrows():
        reference_texts = [row[reference_column]]
        candidate_text = row[candidate_column]
        try:
            references.append(reference_texts)
            candidates.append(candidate_text)
        except Exception as e:
            print(f"Errore nel calcolo del punteggio BLEU per la riga: {row}")
            print(f"Errore: {e}")

    overall_bleu_score = sacrebleu.corpus_bleu(candidates, [list(ref) for ref in zip(*references)])
    return overall_bleu_score.score

#Functions for calculate CodeBLEU score
def get_ast_similarity(reference_code, candidate_code):
    reference_ast = ast.parse(reference_code)
    candidate_ast = ast.parse(candidate_code)
    
    reference_nodes = [node.__class__.__name__ for node in ast.walk(reference_ast)]
    candidate_nodes = [node.__class__.__name__ for node in ast.walk(candidate_ast)]
    
    common_nodes = set(reference_nodes) & set(candidate_nodes)
    total_nodes = set(reference_nodes) | set(candidate_nodes)
    
    similarity_score = len(common_nodes) / len(total_nodes)
    return similarity_score

def longest_common_subsequence(seq1, seq2):
    sm = SequenceMatcher(None, seq1, seq2)
    match = sm.find_longest_match(0, len(seq1), 0, len(seq2))
    lcs_length = match.size
    return lcs_length

def analyze_data_flow(code):
    parsed_code = ast.parse(code)
    variables = [node.id for node in ast.walk(parsed_code) if isinstance(node, ast.Name)]
    return variables

def get_data_flow_similarity(reference_code, candidate_code):
    reference_data_flow = analyze_data_flow(reference_code)
    candidate_data_flow = analyze_data_flow(candidate_code)
    
    lcs_length = longest_common_subsequence(reference_data_flow, candidate_data_flow)
    similarity_score = lcs_length / max(len(reference_data_flow), len(candidate_data_flow))
    
    return similarity_score

def calculate_codebleu(reference_code, candidate_code):
    #calculate blue score
    reference_texts = [reference_code]
    bleu_score = sacrebleu.sentence_bleu(candidate_code, reference_texts).score
    
    # Calculate AST similarity
    ast_similarity = get_ast_similarity(reference_code, candidate_code)
    
    # Calculate Data flow similarity
    data_flow_similarity = get_data_flow_similarity(reference_code, candidate_code)
    
    # Combining different scores
    codebleu_score = 0.4 * bleu_score + 0.3 * ast_similarity + 0.3 * data_flow_similarity
    return codebleu_score

def calculate_code_bleu_from_csv(file_path, candidate_column, reference_column):
    df = pd.read_csv(file_path)
    total_codebleu_score = 0
    count = 0
    errors = []
    
    reference_column = reference_column.strip()
    candidate_column = candidate_column.strip()

    for index, row in df.iterrows():
        reference_code = row[reference_column]
        candidate_code = row[candidate_column]
        try:
            codebleu_score = calculate_codebleu(reference_code, candidate_code)
            total_codebleu_score += codebleu_score
            count += 1
        except Exception as e:
            print(f"Errore nel calcolo del punteggio CodeBLEU per la riga: {index + 2}")
            print(f"Errore: {e}")
            errors.append({"error": str(e), "row": index + 2 })

    # Calculate scores average
    if count > 0:
        average_codebleu_score = total_codebleu_score / count
    else:
        average_codebleu_score = 0
    
    return {"score": average_codebleu_score, "errors": errors}

#Functions for calculate CrystalBLEU score
def calculate_crystalbleu(reference_code, candidate_code):
    # Calculate blue score
    reference_texts = [reference_code]
    bleu_score = sacrebleu.sentence_bleu(candidate_code, reference_texts).score
    
    # Calculate AST similarity
    ast_similarity = get_ast_similarity(reference_code, candidate_code)
    
    # Combining different scores
    crystalbleu_score = 0.5 * bleu_score + 0.5 * ast_similarity
    return crystalbleu_score

def calculate_crystal_bleu_from_csv(file_path, candidate_column, reference_column):
    df = pd.read_csv(file_path)
    total_crystalbleu_score = 0
    count = 0
    errors = []

    reference_column = reference_column.strip()
    candidate_column = candidate_column.strip()

    for index, row in df.iterrows():
        reference_code = row[reference_column]
        candidate_code = row[candidate_column]
        try:
            crystalbleu_score = calculate_crystalbleu(reference_code, candidate_code)
            total_crystalbleu_score += crystalbleu_score
            count += 1
        except Exception as e:
            print(f"Errore nel calcolo del punteggio CrystalBLEU per la riga: {index + 2}")
            print(f"Errore: {e}")
            errors.append({"error": str(e), "row": index + 2})

    # Calculate scores average
    if count > 0:
        average_crystalbleu_score = total_crystalbleu_score / count
    else:
        average_crystalbleu_score = 0
    
    return {"score": average_crystalbleu_score, "errors": errors}