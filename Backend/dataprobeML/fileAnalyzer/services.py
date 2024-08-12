import sacrebleu
import pandas as pd

def calculate_bleu_score(reference_texts, candidate_text):
    score = sacrebleu.sentence_bleu(candidate_text, reference_texts)
    return score.score

def calculate_bleu_from_csv(file_path):
    df = pd.read_csv(file_path)
    references = []
    candidates = []

    for _, row in df.iterrows():
        reference_texts = [row['reference']]
        candidate_text = row['candidate']
        try:
            references.append(reference_texts)
            candidates.append(candidate_text)
        except Exception as e:
            print(f"Errore nel calcolo del punteggio BLEU per la riga: {row}")
            print(f"Errore: {e}")

    overall_bleu_score = sacrebleu.corpus_bleu(candidates, [list(ref) for ref in zip(*references)])
    return overall_bleu_score.score

def calculate_crystal_bleu(file_path):  # TODO
    return {"crystal_bleu_score": 0}

def calculate_code_bleu(file_path):  # TODO
    return {"code_bleu_score": 0}