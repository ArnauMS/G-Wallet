const functions = require("firebase-functions");
const nodeMailer = require("nodemailer");
const sha512 = require("js-sha512");
const admin = require("firebase-admin");
const FieldValue = require('firebase-admin').firestore.FieldValue
const { getFirestore } = require("firebase-admin/firestore");

/*var serviceAccount = require("./../g-wallet-2991d-firebase-adminsdk-guelw-bc46b2af42.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});*/

admin.initializeApp(functions.config().firebase);

const firestore = getFirestore();


let  transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gwalletapp@gmail.com',
        pass: 'yhgqmragqnradxmh'
    }
});

async function generateToken(email){
    const token = Math.random().toString(36).substring(2);
    const hash = sha512(token);
    const verify = await firestore.collection("Tokens").doc(hash).get();
    while(verify.exists){
        const token = Math.random().toString(36).substring(2);
        const hash = sha512(token);
        const verify = await firestore.collection("Tokens").doc(hash).get();
    }
    await firestore.collection("Tokens").doc(hash).set({"email": email});
    return token
}

exports.sendMail = functions.https.onCall(async (data, context) => {
    let i = 0
    while (data.mail.length>i) {
        const token = await generateToken(data.mail[i]);
        const link = "https://gwallet.web.app/invite?group="+data.groupID+"&token="+token;
        const mailOptions = {
            from: 'gwalletapp@gmail.com',
            to: data.mail[i],
            subject: 'Empieza a compartir gastos con el grupo '+data.groupName,
            html: `<h2>Te han invitado a compartit gastos en ${data.groupName}</h2>
                    <h3>Empieza a compartir tus gastos en este grupo desde G-Wallet:
                    <a href="${link}">${link}</a>`
        }
        i++
        transporter.sendMail(mailOptions, (erro, info) => {
            if (erro) {
                console.log(erro)
            }
            console.log("Sent!")
        })
    }
});

exports.manageInvite = functions.https.onCall(async (data,context) => {
    if(data.status){
        const verify = await firestore.collection("Tokens").doc(sha512(data.token)).get();
        if(verify.exists){
            await firestore.collection("Grupos").doc(data.group).update({"participantes": FieldValue.arrayUnion(data.user)}).then(async () => {console.log("DELETING IN PROGRESS");await firestore.collection("Tokens").doc(sha512(data.token)).delete()});
        }
        else{
            //OUTPUT ERROR MSG
        }
    }
    else{
            await firestore.collection("Tokens").doc(sha512(data.token)).delete();
    }
});