
// Select a random number
function random(a, b) {
  return 0.5 - Math.random();
}

// Divide amount in equivalent payments
const divide = (amount, n) => [...Array(n)].map((_, i) => Math.floor(amount / n) + (i < amount % n)).reverse();

//Divide equal amounts randomly if is necessary
function splitExpenses(amounts, participants) {
  const totalAmount = amounts.reduce((sum, amount) => sum + amount * 100, 0);
  let amountPerParticipant = divide(totalAmount, participants.length);
  const equalAmount = amountPerParticipant.every(
    (val, i, arr) => val === arr[0]
  );

  if (!equalAmount) {
    amountPerParticipant = amountPerParticipant.sort(random);
  }

  return amountPerParticipant;
}


function calculatePayments(expenses, divisa) {
  const participantBalances = {};
  const totalParticipants = new Set();
  let transactions = [];

  //console.log(transactions);

  for (const expense of expenses) {
    const participants = expense.participantes;
    const amounts = expense.cantidades;
    const visited = expense.visitado;

    let amountPerParticipant = [];

    //Detect if the payment is already calculated
    if (visited != true) {
      //console.log("Adios como estas " + expense.category);
      amountPerParticipant = expense.visitado;
    } else {
      expense.visitado = splitExpenses(amounts, participants);
    }

    //console.log("AMOUNT PER PARTICIPANT EXPENSE: "+ amountPerParticipant);

    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      const amountPaid = amounts[i];

      const balance = amountPaid * 100 - amountPerParticipant[i];
      //console.log((amountPaid*100) + " - " + amountPerParticipant[i] + " = " + balance);
      if (!(participant in participantBalances)) {
        participantBalances[participant] = 0;
        totalParticipants.add(participant);
        //console.log(participantBalances);
      }

      participantBalances[participant] += balance;
      //console.log(participantBalances);
    }
  }

  // Check amount to pay
  while (true) {
    let positives = [];
    let negatives = [];

    // Paso 1: Encontrar las personas con saldos positivos y negativos
    //console.log(participantBalances);
    for (let person in participantBalances) {
      if (participantBalances[person] > 0) {
        positives.push(person);
      } else if (participantBalances[person] < 0) {
        negatives.push(person);
      }
    }

    // Paso 2: Salir del bucle si no hay más personas con saldos positivos o negativos
    if (positives.length === 0 || negatives.length === 0) {
      break;
    }

    // Paso 3: Encontrar la persona con el saldo más alto en valor absoluto de cada lista
    let maxPositive = positives.reduce((a, b) =>
      participantBalances[a] > participantBalances[b] ? a : b
    );
    let maxNegative = negatives.reduce((a, b) =>
      participantBalances[a] < participantBalances[b] ? a : b
    );

    // Paso 4: Calcular el valor de la transacción
    let transactionValue = Math.min(
      participantBalances[maxPositive],
      -participantBalances[maxNegative]
    );

    // Paso 5: Actualizar los saldos de las personas involucradas en la transacción
    participantBalances[maxPositive] -= transactionValue;
    participantBalances[maxNegative] += transactionValue;

    // Paso 6: Imprimir un mensaje con los detalles de la transacción
    console.log(
      `${maxNegative} debe a ${maxPositive} ${Math.abs(transactionValue) / 100
      } euros.`
    );

    let transaction = {
      usuarioDebe: maxNegative,
      usuarioRecibe: maxPositive,
      cantidad: Math.abs(transactionValue) / 100,
    };

    transactions.push(transaction);
    //console.log(participantBalances);
  }

  // console.log(participantBalances); // debería imprimir: { Juan: 0, Maria: 0, Pedro: 0, Roger: 0 }

  //console.log(transactions);
  return transactions;
}


