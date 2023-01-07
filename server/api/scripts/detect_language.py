import json, sys
from langdetect import detect

tweets = sys.argv[1]

tweets_data = json.loads(tweets)
output = []

for tweet in tweets_data:
    output.append(1 if detect(tweet) == 'en' else 0)

print(output)