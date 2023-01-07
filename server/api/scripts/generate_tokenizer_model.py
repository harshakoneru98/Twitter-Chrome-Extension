from transformers import AutoTokenizer, AutoModelForSequenceClassification
import pickle

tokenizer = AutoTokenizer.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment-latest")
pickle.dump(tokenizer, open('tokenizer.pkl', 'wb'))

model = AutoModelForSequenceClassification.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment-latest")
pickle.dump(model, open('classifier.pkl', 'wb'))