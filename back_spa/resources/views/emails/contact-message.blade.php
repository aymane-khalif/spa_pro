<!doctype html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:30px;background:#f5f3ed;color:#263e34;font-family:Arial,sans-serif">
<table role="presentation" style="width:100%;max-width:600px;margin:auto;background:#fffdf7;border:1px solid #dce2d6;border-radius:16px"><tr><td style="padding:32px">
<p style="font-size:12px;letter-spacing:3px;color:#a18858">LUNÉA SPA</p>
<h1 style="font:normal 28px Georgia,serif">Nouveau message de contact</h1>
<p><strong>Nom :</strong> {{ $contactMessage->nom }}</p>
<p><strong>Email :</strong> {{ $contactMessage->email }}</p>
<p><strong>Sujet :</strong> {{ $contactMessage->sujet }}</p>
<div style="margin-top:24px;padding:20px;background:#edf0e7;border-radius:10px;white-space:pre-wrap;line-height:1.7">{{ $contactMessage->message }}</div>
<p style="margin-top:24px;font-size:12px;color:#69766c">Répondez directement à cet email pour contacter l’expéditeur.</p>
</td></tr></table></body></html>
