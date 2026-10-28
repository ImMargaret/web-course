const rollButton = document.querySelector('#rollButton');
const playerDice = document.querySelector('#playerDice');
const computerDice = document.querySelector('#computerDice');
const playerScore = document.querySelector('#playerScore');
const computerScore = document.querySelector('#computerScore');
const result = document.querySelector('#result');

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function rollTwoDice() {
  return [rollDie(), rollDie()];
}

function diceText(dice) {
  return dice.join('  ');
}

rollButton.addEventListener('click', () => {
  const player = rollTwoDice();
  const computer = rollTwoDice();

  const playerTotal = player[0] + player[1];
  const computerTotal = computer[0] + computer[1];

  playerDice.textContent = diceText(player);
  computerDice.textContent = diceText(computer);

  playerScore.textContent = `Сумма: ${playerTotal}`;
  computerScore.textContent = `Сумма: ${computerTotal}`;

  if (playerTotal > computerTotal) {
    result.textContent = '🎉 Победил игрок!';
  } else if (playerTotal < computerTotal) {
    result.textContent = '🤖 Победил компьютер!';
  } else {
    result.textContent = '🤝 Ничья!';
  }
});
