//Initialize Module
Module.register("quotes", {

	// Module Config
	defaults: {
		quotes: {
			//quotes for any time of day
			anytime: [
				"Be the energy you want to attract."
			],
			//quotes for morning
			morning: [
				"Set a goal that makes you want to jump out of bed in the morning.",
				"I opened two gifts this morning. They were my eyes.",
				"Smile in the mirror. Do that every morning and you’ll start to see a big difference in your life."
			],
			//quotes for middle of the day
			afternoon: [
				"Think like a proton. Always positive.",
				"Keep looking up. That's the secret of life.",
				"Be a fruit loop in a world of cheerios."
			],
			//quotes for evening
			evening: [
				"Everyday may not be good, but there is something good in every day.",
				"If you get tired, learn to rest, not to quit.",
				"You are amazing. Remember that."
			]
		},
		//milliseconds between quote change
		updateInterval: 30000,
		// not using currently
		remoteFile: null,
		//how fast the quote fades out
		fadeSpeed: 4000,
		//what time is considered morning
		morningStartTime: 4,
		morningEndTime: 12,
		//what is considered afternoon
		afternoonStartTime: 12,
		afternoonEndTime: 17
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		this.lastQuoteIndex = -1;

		var self = this;
		if (this.config.remoteFile != null) {
			this.quoteFile(function(response) {
				self.config.quotes = JSON.parse(response);
				self.updateDom();
			});
		}

		// Schedule update timer.
		setInterval(function() {
			self.updateDom(self.config.fadeSpeed);
		}, this.config.updateInterval);
	},

	/* randomIndex(quotes)
	 * Generate a random index for a list of quotes.
	 *
	 * argument quotes Array<String> - Array with quotes.
	 *
	 * return Number - Random index.
	 */
	
	 //This generates a random index for the list 
	randomIndex: function(quotes) {
		if (quotes.length === 1) {
			return 0;
		}

		var generate = function() {
			return Math.floor(Math.random() * quotes.length);
		};

		var quoteIndex = generate();

		while (quoteIndex === this.lastquoteIndex) {
			quoteIndex = generate();
		}

		this.lastquoteIndex = quoteIndex;

		return quoteIndex;
	},

	/* quoteArray()
	 * Retrieve an array of quotes for the time of the day.
	 *
	 * return quotes Array<String> - Array with quotes for the time of the day.
	 */

	 //Makes an array for times of day
	quoteArray: function() {
		var hour = moment().hour();
		var quotes;

		if (hour >= this.config.morningStartTime && hour < this.config.morningEndTime && this.config.quotes.hasOwnProperty("morning")) {
			quotes = this.config.quotes.morning.slice(0);
		} else if (hour >= this.config.afternoonStartTime && hour < this.config.afternoonEndTime && this.config.quotes.hasOwnProperty("afternoon")) {
			quotes = this.config.quotes.afternoon.slice(0);
		} else if(this.config.quotes.hasOwnProperty("evening")) {
			quotes = this.config.quotes.evening.slice(0);
		}

		if (typeof quotes === "undefined") {
			quotes = new Array();
		}

		return quotes;
	},

	/* quoteFile(callback)
	 * Retrieve a file from the local filesystem
	 */
	quoteFile: function(callback) {
		var xobj = new XMLHttpRequest(),
			isRemote = this.config.remoteFile.indexOf("http://") === 0 || this.config.remoteFile.indexOf("https://") === 0,
			path = isRemote ? this.config.remoteFile : this.file(this.config.remoteFile);
		xobj.overrideMimeType("application/json");
		xobj.open("GET", path, true);
		xobj.onreadystatechange = function() {
			if (xobj.readyState == 4 && xobj.status == "200") {
				callback(xobj.responseText);
			}
		};
		xobj.send(null);
	},

	/* quoteArray()
	 * Retrieve a random quote.
	 *
	 * return quote string - A quote.
	 */
	randomquote: function() {
		var quotes = this.quoteArray();
		var index = this.randomIndex(quotes);

		return quotes[index];
	},

	// Override dom generator.
	getDom: function() {
		var quoteText = this.randomquote();

		var quote = document.createTextNode(quoteText);
		var wrapper = document.createElement("div");
		wrapper.className = this.config.classes ? this.config.classes : "thin xlarge bright pre-line";
		wrapper.appendChild(quote);

		return wrapper;
	},
});