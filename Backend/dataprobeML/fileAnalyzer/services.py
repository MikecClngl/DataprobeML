import csv
from datetime import *
import io
import re
import sacrebleu
import pandas as pd
import evaluate
from codebleu import calc_codebleu

meteor_metric = evaluate.load("meteor")
rouge_metric = evaluate.load("rouge")

#BLEU score
def calculate_bleu_csv(file_path, candidate_column, reference_column):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    content = content.replace(',\n', ',') 
    content = "\n".join([line for line in content.splitlines() if line.strip()])
    df = pd.read_csv(io.StringIO(content), quoting=csv.QUOTE_MINIMAL, skipinitialspace=True)

    references = []
    candidates = []
    bleu_scores = [] 

    reference_column = reference_column.strip()
    candidate_column = candidate_column.strip()

    for _, row in df.iterrows():
        reference_text = str(row[reference_column]).strip()
        candidate_text = str(row[candidate_column]).strip()
        
        try:
            bleu_score = sacrebleu.corpus_bleu([candidate_text], [[reference_text]]).score
            bleu_scores.append(f"{bleu_score:.2f}") 
            references.append(reference_text)
            candidates.append(candidate_text)
        except Exception as e:
            print(f"Error calculating BLEU score in row: {row}")
            print(f"Error: {e}")
            bleu_scores.append('-1')

    df['BLEU_Score'] = bleu_scores

    df.to_csv(file_path, index=False)

    overall_bleu_score = sacrebleu.corpus_bleu(candidates, [references]).score

    return overall_bleu_score

def calculate_codebleu_with_library(reference_code, candidate_code, language):
    
    candidate_code = [candidate_code]
    reference_code = [[reference_code]]

    codebleu_result = calc_codebleu(
        references=reference_code,
        predictions=candidate_code,
        lang=language,
    )

    codebleu_score = codebleu_result.get("codebleu", 0)
    return codebleu_score

#CodeBLEU score
def calculate_code_bleu_from_csv(file_path, candidate_column, reference_column, language):
    df = pd.read_csv(file_path)
    total_codebleu_score = 0
    count = 0
    errors = []
    codebleu_scores = []

    for index, row in df.iterrows():
        reference_code = str(row[reference_column])
        candidate_code = str(row[candidate_column])
        try:
            codebleu_score = calculate_codebleu_with_library(reference_code, candidate_code, language)
            codebleu_scores.append(round(codebleu_score, 2)*100)
            total_codebleu_score += codebleu_score
            count += 1
        except Exception as e:
            print(f"Error calculating CodeBLEU score in row: {index + 2}")
            print(f"Error: {e}")
            codebleu_scores.append(None)
            errors.append({"error": str(e), "row": index + 2})

    df['CodeBLEU_Score'] = codebleu_scores
    df.to_csv(file_path, index=False)

    average_codebleu_score = total_codebleu_score / count if count > 0 else 0
    
    return {"score": average_codebleu_score*100, "errors": errors}

def remove_trivial_tokens(code):
    trivial_tokens = r"[{}();,\s]+"
    return re.sub(trivial_tokens, " ", code).strip()

#CrystalBLEU score
def calculate_crystalbleu(reference_code, candidate_code):
    filtered_reference = remove_trivial_tokens(reference_code)
    filtered_candidate = remove_trivial_tokens(candidate_code)
    
    reference_texts = [filtered_reference]
    crystalbleu_score = sacrebleu.sentence_bleu(filtered_candidate, reference_texts).score
    return crystalbleu_score

def calculate_crystal_bleu_from_csv(file_path, candidate_column, reference_column):
    df = pd.read_csv(file_path)
    total_crystalbleu_score = 0
    count = 0
    errors = []
    crystalbleu_scores = []

    reference_column = reference_column.strip()
    candidate_column = candidate_column.strip()

    for index, row in df.iterrows():
        reference_code = str(row[reference_column])
        candidate_code = str(row[candidate_column])
        try:
            crystalbleu_score = calculate_crystalbleu(reference_code, candidate_code)
            crystalbleu_scores.append(round(crystalbleu_score, 2))
            total_crystalbleu_score += crystalbleu_score
            count += 1
        except Exception as e:
            print(f"Error calculating CrystalBLEU score in row: {index + 2}")
            print(f"Error: {e}")
            crystalbleu_scores.append(None)
            errors.append({"error": str(e), "row": index + 2})

    df['CrystalBLEU_Score'] = crystalbleu_scores
    df.to_csv(file_path, index=False)

    average_crystalbleu_score = total_crystalbleu_score / count if count > 0 else 0
    
    return {"score": average_crystalbleu_score, "errors": errors}

# METEOR score
def calculate_meteor_from_csv(file_path, candidate_column, reference_column):
    df = pd.read_csv(file_path)
    meteor_scores = []
    total_meteor_score = 0
    count = 0
    errors = []

    for index, row in df.iterrows():
        candidate_text = str(row[candidate_column]).strip()
        reference_text = str(row[reference_column]).strip()
        try:
            result = meteor_metric.compute(predictions=[candidate_text], references=[reference_text])
            score = result.get('meteor', None)
            if score is not None:
                meteor_score = float(score)
                meteor_scores.append(round(meteor_score, 2)*100)
                total_meteor_score += meteor_score
                count += 1
            else:
                raise ValueError("METEOR score not found in result.")
        except Exception as e:
            print(f"Error calculating METEOR score in row {index + 2}: {e}")
            meteor_scores.append(None)
            errors.append({"type": "METEOR", "error": str(e)})

    df['METEOR_Score'] = meteor_scores
    df.to_csv(file_path, index=False)

    average_meteor = total_meteor_score / count if count > 0 else 0
    return {"score": average_meteor*100, "errors": errors}

# ROUGE score
def calculate_rouge_from_csv(file_path, candidate_column, reference_column):
    df = pd.read_csv(file_path)
    rouge_scores = []
    total_rouge_score = 0
    count = 0
    errors = []

    for index, row in df.iterrows():
        candidate_text = str(row[candidate_column]).strip()
        reference_text = str(row[reference_column]).strip()
        try:
            result = rouge_metric.compute(predictions=[candidate_text], references=[reference_text])['rouge1']
            rouge_score = float(result) 
            rouge_scores.append(round(rouge_score, 2)*100)
            total_rouge_score += rouge_score
            count += 1
        except Exception as e:
            print(f"Error calculating ROUGE score in row {index + 2}: {e}")
            rouge_scores.append(None)
            errors.append({"type": "ROUGE", "error": str(e)})

    df[f"Rouge_Score"] = rouge_scores
    df.to_csv(file_path, index=False)

    average_rouge = total_rouge_score / count if count > 0 else 0
    return {"score": average_rouge*100, "errors": errors}