import pickle, json, sys
from scipy.special import softmax

tweets = sys.argv[1]
model = pickle.load(open(sys.argv[2], 'rb'))
tokenizer = pickle.load(open(sys.argv[3], 'rb'))

tweets_data = json.loads(tweets)

for tweet in tweets_data:
    encoded_input = tokenizer(tweet['tweet_text'], return_tensors='pt')
    output = model(**encoded_input)
    scores = output[0][0].detach().numpy()
    scores = softmax(scores)
    final_score = {
        "positive": scores[2],
        "neutral": scores[1],
        "negative": scores[0]  
    }
    final_data = {
        "tweet_text": tweet['tweet_text'],
        "sentiment_score": final_score,
        "detected_mood": max(final_score, key=final_score.get).upper()
    }
    print(final_data)