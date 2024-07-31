import { createSlice } from "@reduxjs/toolkit";
import { firestore } from "../../firebase/index";
import {
  collection,
  addDoc,
  where,
  orderBy,
  getDocs,
  query,
  arrayUnion,
  arrayRemove,
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase/index.js";
import { makeRandomId } from "../../utils/randomID";

// Select a random number
function random(a, b) {
  return 0.5 - Math.random();
}

// Divide amount in equivalent payments
const divide = (amount, n) => [...Array(n)].map((_, i) => Math.floor(amount / n) + (i < amount % n)).reverse();

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

async function getExpense(docId) {
  const groupData = doc(firestore, 'Grupos', docId);
  const listExpenses = (await getDoc(groupData)).data().gastos;
  //console.log(listExpenses)

  const expenses = await Promise.all(
    listExpenses.map(async (expenseId) => {
      const expenseData = doc(firestore, 'Gastos_Grupales', expenseId);
      const expense = (await getDoc(expenseData)).data();
      return expense;
    })
    
  );

  return expenses;

}

function calculatePayments(expenses, divisa) {
  const participantBalances = {};
  const totalParticipants = new Set();
  let transactions = [];

  console.log(transactions);

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

  console.log(transactions);
  return transactions;
}

async function updateTransaction(docId) {
  const expenses = await getExpense(docId);

  const groupData = doc(firestore, 'Grupos', docId);
  const transactionId = (await getDoc(groupData)).data().transacciones;
  console.log(transactionId)

  let transacciones1 = await calculatePayments(expenses, '€');
  console.log(transacciones1) 

  const transaccionesRef = doc(firestore, 'Transacciones', transactionId);
  await updateDoc(transaccionesRef, { transacciones: transacciones1 });

  return true;
}

async function updateChat(docId, userIdRecibe, userIdDebe, total){
  const docRef = doc(firestore, "Chat", docId);
  const docSnap = await getDoc(docRef);

      
  const newMessage = {
        author: userIdDebe,
        message: `${total}`,
        solicitarPago : false,
        idRecibe: userIdRecibe,
        timestamp: new Date(),
      };

      if (docSnap.exists()) {
        // Actualiza el documento de Chat en Firebase
        await updateDoc(docRef, {
          messages: arrayUnion(newMessage),
        });
      } else {
        // Crea el documento de Chat en Firebase
        await setDoc(docRef, {
          messages: [newMessage],
        });
      }
      return true;
}



/*
let expenses = [
    {
      concept: 'Billetes de avión',
      participantes: [ 'Juan', 'Maria', 'Pedro', 'Ana' ],
      cantidades: [ 200, 0, 0, 125.97 ],
      visitado: [ 8149, 8149, 8149, 8150 ]
    },
    {
        concept: 'Apartamento',
        participantes: [ 'Juan', 'Pedro', 'Andrés', 'Sofía' ],
      cantidades: [ 0, 0, 0, 169.99 ],
      visitado: [ 4249, 4250, 4250, 4250 ]
    },
    {
        concept: 'Transporte público',
        participantes: [ 'Pedro', 'Sofía', 'Miguel', 'David', 'Lucía' ],
      cantidades: [ 10.5, 20.6, 0, 0, 10.5 ],
      visitado: [ 832, 832, 832, 832, 832 ]
    },
    {
        concept: 'Restaurantes',
        participantes: [
        'Juan',   'Maria',
        'Pedro',  'Sofía',
        'Miguel', 'David',
        'Lucía'
      ],
      cantidades: [
         14,  6, 32, 9.5,
        0.5, 10,  0
      ],
      visitado: [
        1028, 1029,
        1028, 1028,
        1029, 1029,
        1029
      ]
    },
    {
        concept: 'Souvenirs',
        participantes: [ 'Juan', 'Maria', 'Andrés', 'Sofía' ],
      cantidades: [ 20, 0, 7, 13 ],
      visitado: [ 1000, 1000, 1000, 1000 ]
    },
    {
        concept: 'Merienda',
        participantes: [ 'Andrés', 'Sofía' ],
      cantidades: [ 5.6, 0 ],
      visitado: [ 280, 280 ]
    },
    {
        concept: 'Tour Guiado',
        participantes: [ 'Javi', 'Maria', 'Andrés', 'Juan' ],
      cantidades: [ 2.25, 4.75, 7, 14 ],
      visitado: [ 700, 700, 700, 700 ]
    },
  
   
  ]; 
let abcd = calculatePayments(expenses, "€");
console.log(abcd)
const transaccionesRef = collection(firestore, "Transacciones");
await addDoc(transaccionesRef, { transacciones: abcd});*/


export { splitExpenses, divide, calculatePayments, random, getExpense, updateTransaction, updateChat };
