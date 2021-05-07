'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-02-24T17:01:17.194Z',
    '2020-02-26T23:36:17.929Z',
    '2020-03-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const deatailsLogin = document.querySelector('.login__details');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0); // 2 characters long and pad it with 0
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();

  // // day/month/year
  // return `${day}/${month}/${year}`;

  return new Intl.DateTimeFormat(locale).format(date);
};

// Function thats less deoendend on underlying data of this specific account
// can be used in any application
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
        <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

// This function doesnt need any argument
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // In each call, print remaining time to the user interface
    labelTimer.textContent = `${min}:${sec}`;

    // When reaching 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    // Decrease 1s
    time--; // time = time - 1
  };
  // Set time to 5 minutes
  let time = 300;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// Experimenting with API
const now = new Date();
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'long', // long will give you the name of the month
  year: 'numeric',
  weekday: 'long',
};

// const locale = navigator.language;
// console.log(locale); // will return the lanuage yo have in your browser

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    deatailsLogin.style.opacity = 0;

    // Create current date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', // long will give you the name of the month
      year: 'numeric',
      // weekday: 'long',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const day = `${now.getDate()}`.padStart(2, 0); // 2 characters long and pad it with 0
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // // day/month/year
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    // timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    setTimeout(function () {
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/* 1. Numbers, Dates, Intls and timers

console.log(23 === 23.0); // true

// Base 10: 0 to 9
// Binary base: 0 to 1

console.log(0.1 + 0.2); // script.js:262 0.30000000000000004 instead of 0.3
// JS just has no better way of representing this number
console.log(0.1 + 0.2 === 0.3); // false, but it should be true
// This is simply an error in JS that we have to accept

// How can we work with numbers?

// Convert string to number
console.log(Number('23'));

// Easier way
console.log(+'23');
// When JS sees the plus operator it will to type coercion, automatically convert all operands to numbers
// This makes the code look cleaner too, so we will replace all the occurences with Number inthe code with the plus sign

// Parsing: We can also parse
// We can parse a number from a string
console.log(Number.parseInt('30px')); // 30
// We can specify a string with parseInt, it can even include symbols
// JS will automatically try to figure out the numbers thats in the string

// IMPORTANT: IT needs to start with a number, otherwise it wont work
console.log(Number.parseInt('e23')); // NaN

// The parseInt function also accepts a second argument, the so called ratix
// Ratix is the base of the numeral system we are using
console.log(Number.parseInt('30px', 10)); // 30
// We are using number from Base 10
// We should always pass that argument, because it can avoid bugs in some situations

// There is also parseFloat
console.log(Number.parseFloat('2.5rem')); // 2.5
// With parseInt, it will stop at the decimal point
console.log(Number.parseInt('2.5rem')); // 2

// 3. isNaN function
// We can use this to check if a value is a number
console.log(Number.isNaN(20)); // false    Is 20 not a number?
console.log(Number.isNaN('20')); // false
console.log(Number.isNaN(+'20X')); // true
console.log(Number.isNaN(23 / 0)); // false, because diving by 0 in maths gives us infinity

// isFinite method is a better way to check if sth is a number
console.log(Number.isFinite(20)); // true
console.log(Number.isFinite('20')); // false
console.log(Number.isFinite(23 / 0)); // false, because again its infinity

// isInteger method

console.log(Number.isInteger(20)); // true
console.log(Number.isInteger(23, 0)); // true
console.log(Number.isInteger(23 / 0)); // false

// IMPORTANT: isFinite and isInteger methods are very useful, keep them in mind.
// isFinite: Whenever you need to check if something is a number or not
// parseFloat: Whenever you need to read a value out of a string for example coming from css

// 2. Math and Rounding

// 1. Squareroot
console.log(Math.sqrt(25)); // 5 // same as (25 ** (1/2));

// Get the maximum value of a couple of values
console.log(Math.max(5, 18, 23, 11, 2)); // 23
console.log(Math.max(5, 18, '23', 11, 2)); // 23   because it does type coersion
console.log(Math.max(5, 18, '23px', 11, 2)); // NaN, because it doesn't parse

// Get the minimum value
console.log(Math.min(5, 18, 23, 11, 2)); // 2

// There are also constants on the math object or math namespace
// If we want to calculate the radius of a circle with 10 px
console.log(Math.PI * Number.parseFloat('10px') ** 2); // 314.1592653589793

// Generate random dicerolls between 1 and 6
console.log(Math.trunc(Math.random() * 6) + 1);

// Generalize Math.random to always generate random integers between 2 values
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
// 0..1 -> 0...(,ax - min) -> min..max

console.log(randomInt(10, 20)); //  13
console.log(randomInt(2, 5)); // 4
console.log(randomInt(1, 9)); // 9
// Always a number between max and min value we specify

// ROUNDING

// Rounding integers

// Remove any decimal parts
console.log(Math.trunc(23.3)); // 23

// Always round to the nearest integer
console.log(Math.round(23.3)); // 23
console.log(Math.round(23.9)); // 24

// Always round up
console.log(Math.ceil(23.3)); // 24
console.log(Math.ceil(23.9)); // 24

// Always round down
console.log(Math.floor(23.3)); // 23
console.log(Math.floor(23.9)); // 23

// All of these methods do type coercion, so if we use a string it will work the same
// console.log(Math.floor('23.9')); // 23

// IMPORTANT: With negative numbers rounding works the other way around
console.log(Math.round(-23.3)); // -23 round now rounds down
console.log(Math.floor(-23.3)); // -24 floor now rounds up
console.log(Math.trunc(-23.3)); // -23

// Floor and round are better than trunc because they work accurately with both positive and negative numbers

// Floating point numbers or Rounding Decimals
// It works a bit different with decimals
console.log((2.7).toFixed(0)); // 3 as a string
// toFixed will always return a string instead of a number
console.log((2.7).toFixed(3)); /// 2.700

// 3. The Ramainder Operator

console.log(5 % 2); // 1
console.log(5 / 2); // 5 = 2 * 2 + 1    1 is the remainder
console.log(8 % 3); // 2

// Useful case is to check if a number is even or odd
// Even numbers are divisible by 2, so if the remainder is 0
console.log(6 % 2); // 0

const isEven = n => n % 2 === 0;
console.log(isEven(8)); // true
console.log(isEven(23)); // false

// Select all rows of our movements

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered'; // on 0, 2, 4, 6,
    if (i % 3 === 0) row.style.backgroundColor = 'blue'; // on 0, 3, 6, 9
  });
});

// Everytime you need to do something for a certain Nth time, then its good to use the remainder operator

//4. Working with BigInt
// We learned that numbers are represented as 64 bits, 64 1s and 0s to represent any number
// There is a limit of how big numbers can be and we can calculate it
console.log(2 ** 53 - 1); // 9007199254740991
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
// JS cannot represent any numbers that are bigger than this one precisely

// Now with BigInt we can store numbers as large as we want
console.log(49820982039482304923840239482039482n); // 49820982039482304923840239482039482n
// adding the n means this is a bigInt number

// can also be done with the bigInt function
console.log(BigInt(49820982039482304923840239482039482));

// Operations with BigInt
console.log(10000n + 10000n); // 20000n
console.log(39840293480239480239480239480230948n * 10000000000n); // script.js:425 398402934802394802394802394802309480000000000n

// BigInts cannot be mixed with regular numbers
const huge = 2827293847239423842347293824;
const num = 23;
// console.log(huge * num); // Error: Cannot mix bigInt with other types
// In this case the function becomes necessary
// console.log(huge * BigInt(num));

// Exceptions: Comparison operators and the plus operator when working with strings
console.log(20n > 15); // true
console.log(20n === 20); // false because when we use the triple operator JS does not to type coercion and now these 2 values have a different type

// More exceptions: string concatenations
console.log(huge + ' is REALLY BIG'); // script.js:439 2.8272938472394236e+27 is REALLY BIG

// What happens with divisions?
console.log(10n / 3n); // 3n
// It will return the closest bigInt

// 5. Creating dates

/* Create a date
// 4 ways of creating dates in JS. All use the new date constructor function, but can accept different parameters

// 1st way: Use the new Date constructor function
const now = new Date();
console.log(now); // Mon Mar 01 2021 16:20:55 GMT+0100 (Central European Standard Time)

// 2nd way: Parse the date from a date string
console.log(new Date('Aug 02 2020 18:05:41')); // Sun Aug 02 2020 18:05:41 GMT+0200 (Central European Summer Time)
console.log(new Date('December 24, 2015')); // Thu Dec 24 2015 00:00:00 GMT+0100 (Central European Standard Time)
// Generally not a good idea to do this, because it can be unrealiable, unless the string was created by JS itself

// We can also pass in year, month, day, hour, minute, seconds into the constructor
console.log(new Date(2037, 10, 19, 15, 23, 5)); // script.js:460 Thu Nov 19 2037 15:23:05 GMT+0100 (Central European Standard Time)

// unix time January 1st 1970
console.log(new Date(0)); // Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)

// convert from days to milliseconds
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // Sun Jan 04 1970 01:00:00 GMT+0100 (Central European Standard Time)
// 3 days * 24 hours * 60 minutes * 60 seconds * 1000

// 3rd way
const future = new Date(2037, 10, 19, 15, 23);
console.log(future); // Thu Nov 19 2037 15:23:00 GMT+0100 (Central European Standard Time)

// get year
console.log(future.getFullYear()); // 2037 , NEVER use getYear(9; ALWAYS use getFullYear();

// others
console.log(future.getMonth()); // 10
console.log(future.getDate()); // 19
console.log(future.getDay()); // 4
console.log(future.getHours()); // 15
console.log(future.getMinutes()); // 23
console.log(future.getSeconds()); // 0

// The ISO String follows an international standards
// Useful to convert date to string
console.log(future.toISOString()); // 2037-11-19T14:23:00.000Z

// Get timestamp of date
console.log(future.getTime()); // 2142253380000
// This is the time that has past since 1970

console.log(new Date(2142253380000)); // Thu Nov 19 2037 15:23:00 GMT+0100 (Central European Standard Time)

// Get current timestamp
console.log(Date.now()); // script.js:495 1614624368121

// All these methods are also available with set
future.setFullYear(2040);
console.log(future); // Mon Nov 19 2040 15:23:00 GMT+0100 (Central European Standard Time)

// 6. Adding dates to Bankist app
// remember padStart Method for the notes

// 7. Operations with Dates

// Whenever we convert date to a number, rexult is timestamp oin miliseconds
// With these miliseconds we can perform calculations

const future2 = new Date(2037, 10, 19, 15, 23);
console.log(Number(future)); // 2236947780000
console.log(+future); // 2236947780000

// We can convert the miliseconds back to dates, hours, minutes, whatever we want

// Function that takes 2 dates and will return the number of days that passed between these 2 dates
// const calcDaysPassed = (date1, date2) =>
//   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24); // convert timestamp to date
// divide by 1000 (miliseconds to seconds), *60 (to minutes), * 60 (to hours), *24 (to days)

// const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4));
// console.log(days1); // 10

// 8. Internationalizing Dates (Intl) */

// 9. Internationalizing Numbers

// Examples
const num = 3884764.23;

const options2 = {
  style: 'unit',
  // style: 'unit, percent currency'  You can choose between these 3 styles
  // With currency, you have to rdefine the currency
  // currency: 'EUR',
  unit: 'mile-per-hour',
};
// Check documendation  mdn constructor properties

console.log('US: ', new Intl.NumberFormat('en-US', options2).format(num)); // 3,884,764.23 mph

console.log('Germany: ', new Intl.NumberFormat('de-DE', options2).format(num)); // 3.884.764,23 mi/h

console.log('Syria: ', new Intl.NumberFormat('ar-SY', options2).format(num));

console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language, options2).format(num)
); // en-GB 3,884,764.23 mph

// 10. Timers
// setTimeout(() => console.log('Here is your pizza'), 3000);
// console.log('Waiting...');

// First Argument: What to do
// Second Argument: When shall we call function. 3000 = 3 seconds

// Important to understand that code execution doesnt stop after first argument
// It will register to run the code after 3 seconds, in the meantime will execute the next code
// So in the console, Waiting will first appear, then 3 seconds later the Here is your Pizza
// This is called ASYNCHRONOUS JAVASCRIPT

// setTimeout(
//   (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
//   3000,
//   'olives',
//   'spinach'
// );
// console.log('Waiting...');

//One more thing, we can cancel the timeout until the delay has passed
// Before the 3 seconds have passed, we can cancel the timeout

// const ingredients = ['olives', 'spinach'];

// const pizzaTimer = setTimeout(
//   (ing1, ing2) => console.log(`Here is your Pizza with ${ing1} and ${ing2}`),
//   3000,
//   ...ingredients
// );
// console.log('Waiting...');

// if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// We store the result of the set timeout function, which is essentially the timer, and we use that variable to clear the timeout
// We can then use that variable to delete the timer with clearTimeout function

// Now if it includes spinach, there will NOT be a message in the console
// Otherwise there will be the message in the console

// WHat if we wanted to run a function over and over again after a a certain amount of time
// setInterval
// Create a clock that will display in our console

// setInterval(function () {
//   const now = new Date();
//   console.log(now); // Fri Mar 12 2021 09:49:59 GMT+0100 (Central European Standard Time)
// }, 3000);

// This callback function is now executing every second

// A clock
// setInterval(function () {
//   const date = new Date();
//   const hour = date.getHours();
//   const minute = date.getMinutes();
//   const sec = date.getSeconds();
//   console.log(`${hour}:${minute}:${sec}`);
// }, 1000);
