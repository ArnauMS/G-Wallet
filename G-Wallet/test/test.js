const { random, divide, splitExpenses, calculatePayments } = require('./splitAlgorithm');


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
await addDoc(transaccionesRef, { transacciones: abcd});