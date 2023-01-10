// Check if element exists or not
let waitForElm = (selector) => {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver((mutations) => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
};

let extract_content_xpath = (selector, type) => {
    let results = document.evaluate(
        selector,
        document,
        null,
        XPathResult.ANY_TYPE,
        null
    );

    let output = [];

    if (type == 'tweet_text') {
        while ((node = results.iterateNext())) {
            if (!node.closest('div[role]')) {
                let tweet_text = node.innerHTML
                    .replace(/<img .*?alt="([^"]+)"[^>]*>/g, ' $1 ') // extract alt text from img tag
                    .replace(/<\/?[a-z][^>]*>/g, ' ') // remove all tags
                    .replace(/\s+/g, ' ')
                    .trim(); // cleanup whitespace
                output.push(tweet_text);
            }
        }
    } else {
        while ((node = results.iterateNext())) {
            let user_tweet_text = node.lastChild.children[0];
            output.push(user_tweet_text);
        }
    }

    return output;
};

// Detects if the tweet is in english langauage or not
let language_detection_endpoint = async (tweets) => {
    let body = tweets.map((tweet) => ({
        tweet_text: tweet
    }));

    try {
        let api_data = await fetch(
            'https://tradework.online/api/language-detection',
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
        );
        let json_data = await api_data.json();
        return json_data;
    } catch (e) {
        console.log('Error identifying language : ', e);
    }
};

// Calculates Sentiment Scores for each tweet
let sentiment_score_endpoint = async (tweets) => {
    try {
        let api_data = await fetch(
            'https://tradework.online/api/sentiment-score',
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tweets)
            }
        );

        let json_data = await api_data.json();
        return json_data;
    } catch (e) {
        console.log('Error calculating sentiment score : ', e);
    }
};

let mood_emoji = (mood) => {
    if (mood == 'POSITIVE') {
        return String.fromCodePoint(128522);
    } else if (mood == 'NEUTRAL') {
        return String.fromCodePoint(128528);
    } else if (mood == 'NEGATIVE') {
        return String.fromCodePoint(128577);
    } else {
        return 'NO_MOOD';
    }
};

let generate_moods = (indexes, moods) => {
    output = [];
    mood_index = 0;
    for (let i = 0; i < indexes.length; i++) {
        if (indexes[i] == 1) {
            output.push(mood_emoji(moods[mood_index]));
            mood_index += 1;
        } else {
            output.push('NO_MOOD');
        }
    }

    return output;
};

let scrollStop = (callback, refresh = 66) => {
    // Make sure a valid callback was provided
    if (!callback || typeof callback !== 'function') return;

    // Setup scrolling variable
    let isScrolling;

    // Listen for scroll events
    window.addEventListener(
        'scroll',
        function (event) {
            // Clear our timeout throughout the scroll
            window.clearTimeout(isScrolling);

            // Set a timeout to run after scrolling ends
            isScrolling = setTimeout(callback, refresh);
        },
        false
    );
};

let calculate_sentiment = async () => {
    try {
        let tweets = extract_content_xpath(
            '//article[@data-testid="tweet"]//div[@data-testid="tweetText"]',
            'tweet_text'
        );

        let user_tweets = extract_content_xpath(
            '//article[@data-testid="tweet"]//div[@data-testid="User-Names"]',
            'user_tweet_text'
        );

        let ld_data = await language_detection_endpoint(tweets);

        if (ld_data.length > 0) {
            let english_tweet_index = [];
            let filter_en_data = [];

            await ld_data.map((tweet) => {
                if (tweet.is_english) {
                    english_tweet_index.push(1);
                    filter_en_data.push({
                        tweet_text: tweet.tweet_text
                    });
                } else {
                    english_tweet_index.push(0);
                }
            });

            let ss_data = await sentiment_score_endpoint(filter_en_data);

            let moods = ss_data.map((mood) => mood.detected_mood);

            let final_moods = generate_moods(english_tweet_index, moods);

            if (final_moods) {
                for (let i = 0; i < final_moods.length; i++) {
                    let mood_html = `
                    <div dir="ltr" aria-hidden="true" class="css-901oao r-14j79pv r-1q142lx r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-s1qlax r-qvutc0"><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">·</span></div>
                    <div class="tweet_mood"><p style="font-size: 15px;color: rgb(83, 100, 113);font-family: TwitterChirp, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif;">Detected Mood: ${final_moods[i]}</p></div>
                    `;
                    if (
                        user_tweets[i] &&
                        user_tweets[i].lastChild &&
                        user_tweets[i].lastChild.classList &&
                        user_tweets[i].lastChild.classList[0] != 'tweet_mood' &&
                        final_moods[i] != 'NO_MOOD'
                    ) {
                        user_tweets[i]?.insertAdjacentHTML(
                            'beforeend',
                            mood_html
                        );
                    }
                }
            }
        }
    } catch (e) {
        console.log('Error : ', e);
    }
};

waitForElm('section').then(async (elm) => {
    waitForElm('article').then(async (elment) => {
        await calculate_sentiment();
    });

    scrollStop(async () => {
        await calculate_sentiment();
    });
});
