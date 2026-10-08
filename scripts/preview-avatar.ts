/**
 * 3B avatar sahnesini tek basina HTML dosyasi olarak yazar (gorsel kontrol icin).
 * Calistirma: npx tsx scripts/preview-avatar.ts <kelime> <egitmen> <cikti.html>
 */
import { writeFileSync } from 'node:fs';
import { signFor } from '@/data/signs';
import { tutorById } from '@/data/tutors';
import { avatarHtml } from '@/ml/avatarHtml';
import { full } from '@/ml/handModel';

const [word = 'merhaba', tutor = 'sirius', out = 'avatar-preview.html'] = process.argv.slice(2);
const sign = signFor(word);
console.log(word, JSON.stringify(sign));
writeFileSync(out, avatarHtml(sign.map(full), '#E6B84F', tutorById(tutor)));
