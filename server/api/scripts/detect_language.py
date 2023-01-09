import json, sys
from langdetect import detect

tweets = sys.argv[1]

tweets_data = json.loads(tweets)
output = []

for tweet in tweets_data:
    try:
        if detect(tweet) == 'en':
            output.append(1)
        else:
            output.append(0)
    except:
        output.append(0)
print(output)