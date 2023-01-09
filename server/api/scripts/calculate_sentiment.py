import json, sys
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

tweets = sys.argv[1]
tweets_data = json.loads(tweets)

sentiment = SentimentIntensityAnalyzer()

for tweet in tweets_data:
    output = sentiment.polarity_scores(tweet['tweet_text'])
    final_score = {
        "positive": output['pos'],
        "neutral": output['neu'],
        "negative": output['neg']  
    }
    final_data = {
        "tweet_text": tweet['tweet_text'],
        "sentiment_score": final_score,
        "detected_mood": max(final_score, key=final_score.get).upper()
    }
    print(json.dumps(final_data))