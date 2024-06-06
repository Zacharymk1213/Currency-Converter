/*
Express is for the server
Axios for requests
Morgan logging user agent for testing
fs,url,path - various bits of functionality like reading the currency names json file
*/
import express from "express";
import axios from "axios";
import morgan from "morgan";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

/*
Setting up the express server
Reading the currency names json file
setting the view engine and default directories for stuff
*/

const api_key = "38e20198bbddadd13db09267";
const app = express();
const port = 5000;
const currencies = JSON.parse(fs.readFileSync('currency_names.json', 'utf8'));
app.use(express.static("views"));
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set up morgan and body parser middlewares
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['user-agent'](req, res),
  ].join(' ');
}));
app.use(express.urlencoded({ extended: true }));

// Home page
app.get("/", async (req, res) => {
  console.log('GET request received');
  // Use morgan to get the user agent
  console.log(req.get('User-Agent'));
  res.render('index', { currencies });
});

// App logic
app.post("/convert", async (req, res) => {
  const { amount, fromCurrency, toCurrency } = req.body;
  console.log(amount, fromCurrency, toCurrency);
  try {
    const result = await axios.get("https://v6.exchangerate-api.com/v6/" + api_key + "/pair/" + fromCurrency + "/" + toCurrency + "/" + amount);
    console.log('POST request received');
    console.log(req.get('User-Agent'));
    console.log(amount + " " + fromCurrency + " in " + toCurrency + " is " + result.data.conversion_result);
    res.render('index', { currencies, output_amount: result.data.conversion_result, input_amount: amount, fromCurrency: fromCurrency, toCurrency: toCurrency });
  } catch (error) {
    console.error(error);
    res.render('index', { currencies, error: 'There was an error processing your request. Please try again.' });
  }
});

// Running the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
