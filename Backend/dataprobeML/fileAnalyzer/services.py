import nltk
from nltk.translate.bleu_score import corpus_bleu
import pandas as pd

def calculate_bleu_score(reference_texts, candidate_text):
    reference_tokens = [[nltk.word_tokenize(ref.lower())] for ref in reference_texts]
    candidate_tokens = nltk.word_tokenize(candidate_text.lower())
    score = corpus_bleu(reference_tokens, [candidate_tokens])
    return score

def calculate_bleu_from_csv(file_path):
    df = pd.read_csv(file_path)
    results = []
    for _, row in df.iterrows():
        reference_texts = [row['reference']]
        candidate_text = row['candidate']
        try:
            bleu_score = calculate_bleu_score(reference_texts, candidate_text)
            results.append({
                'reference': row['reference'],
                'candidate': row['candidate'],
                'bleu_score': bleu_score
            })
        except Exception as e:
            print(f"Errore nel calcolo del punteggio BLEU per la riga: {row}")
            print(f"Errore: {e}")
    return results

def calculate_crystal_bleu(file_path):     # TODO
    return {"crystal_bleu_score": 0}

def calculate_code_bleu(file_path):    # TODO

    return {"code_bleu_score": 0}