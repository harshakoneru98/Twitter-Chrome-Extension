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

waitForElm('section').then(async (elm) => {
    // Initialize tweets storage
    await chrome.storage.sync.remove('tweets');
    await chrome.storage.sync.remove('user_tweets');
    await chrome.storage.sync.set({ tweets: [] });
    await chrome.storage.sync.set({ user_tweets: [] });

    // Select the node that will be observed for mutations
    const targetNode = document.getElementsByTagName('section')[0];

    // Options for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = async (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                let results = document.evaluate(
                    '//article[@data-testid="tweet"]//div[@data-testid="tweetText"]',
                    document,
                    null,
                    XPathResult.ANY_TYPE,
                    null
                );

                let user_results = document.evaluate(
                    '//article[@data-testid="tweet"]//div[@data-testid="User-Names"]',
                    document,
                    null,
                    XPathResult.ANY_TYPE,
                    null
                );

                let tweets = [];
                let user_tweets = [];

                // Extract tweet text even with icons
                while ((node = results.iterateNext())) {
                    let tweet_text = node.innerHTML
                        .replace(/<img .*?alt="([^"]+)"[^>]*>/g, ' $1 ') // extract alt text from img tag
                        .replace(/<\/?[a-z][^>]*>/g, ' ') // remove all tags
                        .replace(/\s+/g, ' ')
                        .trim(); // cleanup whitespace
                    tweets.push(tweet_text);
                }

                while ((node = user_results.iterateNext())) {
                    let tweet_text = node.lastChild.children[0];
                    user_tweets.push(tweet_text);
                }

                let prev_tweets = await chrome.storage.sync.get(['tweets']);
                let prev_user_tweets = await chrome.storage.sync.get([
                    'user_tweets'
                ]);

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

                if (
                    prev_tweets.tweets &&
                    prev_user_tweets &&
                    JSON.stringify(tweets) !==
                        JSON.stringify(prev_tweets.tweets)
                ) {
                    try {
                        await chrome.storage.sync.set({ tweets: tweets });
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

                            let ss_data = await sentiment_score_endpoint(
                                filter_en_data
                            );

                            let moods = ss_data.map(
                                (mood) => mood.detected_mood
                            );

                            let final_moods = generate_moods(
                                english_tweet_index,
                                moods
                            );

                            if (final_moods) {
                                for (let i = 0; i < final_moods.length; i++) {
                                    let mood_html = `
                                    <div dir="ltr" aria-hidden="true" class="css-901oao r-14j79pv r-1q142lx r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-s1qlax r-qvutc0"><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">·</span></div>
                                    <div class="tweet_mood"><p style="font-size: 15px;color: rgb(83, 100, 113);font-family: TwitterChirp, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif;">Detected Mood: ${final_moods[i]}</p></div>
                                    `;
                                    if (
                                        user_tweets[i].lastChild &&
                                        user_tweets[i].lastChild.classList &&
                                        user_tweets[i].lastChild.classList[0] !=
                                            'tweet_mood' &&
                                        final_moods[i] != 'NO_MOOD'
                                    ) {
                                        user_tweets[i]?.insertAdjacentHTML(
                                            'beforeend',
                                            mood_html
                                        );
                                    }
                                }
                            }
                            // console.log('Mood Data : ', final_moods);
                        }
                    } catch (e) {
                        console.log('Error : ', e);
                    }
                }
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
});
