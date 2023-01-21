# Tweet Sentiment Score using Chrome Extension

TASK 👉  [check here](https://github.com/harshakoneru98/Twitter-Chrome-Extension/blob/main/task.md)
DEMO 👉  [https://drive.google.com/file/d/1qltu1XuK5M_aQe2mpixuZNtZFRhlXgwh/view?usp=share_link](https://drive.google.com/file/d/1qltu1XuK5M_aQe2mpixuZNtZFRhlXgwh/view?usp=share_link)

## About
A Chrome Extension reads the tweets in the user timeline and calculates the sentiment score for English language tweets, and displays the tweet sentiment mood in each English tweet.

## Technology Stack
- Node.js
- Python
- JavaScript
- Manifest V3
- AWS (EC2, Route53)
- Nginx
- PM2

## Methods used to calculate sentiment score
### 1. /api/language-detection endpoint
1. Used Language detection library ported from Google's **language-detection**.
2. Tried other libraries like **Lingua** but failing for some of the base cases.

### 2. /api/sentiment-score endpoint
1. Used **vaderSentiment - SentimentIntensityAnalyzer**, which is a lexicon and rule-based sentiment analysis tool that is specifically attuned to sentiments expressed in social media.
2. Tried other Transformer based pre-trained models like **twitter-roberta-base-sentiment-latest**. I got very accurate results in local code, but not used due to memory limitations with AWS EC2 .micro instance as I am unable to install heavy libraries like torch, tranformers along with 500MB pre-trained model.

## Setup
### Local Code Setup
Get the code by cloning this repository using git
```
git clone https://github.com/harshakoneru98/Twitter-Chrome-Extension.git
```
Open Chrome Browser and enable developer mode in extensions. Click on Load Unpacked and load the cloned folder Twitter-Chrome-Extension. Open Twitter and be ready to experience tweet mood detection.

### Server Setup in AWS
1. Create an EC2 instance. Add port 8080 in the Inbound rules at Security Details.
2. Create a domain and integrate it with EC2 instance and add SSL for HTTPS.
3. Connect to the EC2 instance and install Node.js, Python, Nginx, PM2 and git.
4. Install vaderSentiment and langdetect python packages
5. Clone the repository using **git clone https://github.com/harshakoneru98/Twitter-Chrome-Extension.git**
6. Go to server folder and install packages using **npm install**
7. Start Node.js server with PM2 using **pm2 start server.js**
8. Go to Nginx folder (/etc/nginx) and add ssl folder with SSL files
9. Update the nginx.conf file as mentioned in the repository.
10. Start the nginx using **systemctl start nginx**

## References
1. http://nginx.org/en/docs/http/configuring_https_servers.html
2. https://pm2.keymetrics.io/docs/usage/quick-start/
3. https://techblog.geekyants.com/aws-and-ec2-deploying-a-nodejs-application-using-nginx-and-pm2
