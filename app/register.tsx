import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthShell } from '@/components/AuthShell';
import { Field } from '@/components/Field';
import { Button3D } from '@/components/Button3D';
import { ErrorNote } from '@/components/ErrorNote';

export default function RegisterScreen() {
  const register = useAuthStore((s) => s.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (password !== confirm) {
      setError('Şifreler birbiriyle eşleşmiyor.');
      return;
    }
    setBusy(true);
    setError(await register(name, email, password));
    setBusy(false);
  };

  return (
    <AuthShell title="Hesap Oluştur" subtitle="İlk işaretini öğrenmeye başla">
      <View style={styles.form}>
        <Field
          label="ADIN"
          icon="person-outline"
          value={name}
          onChangeText={setName}
          placeholder="Adın"
          autoComplete="name"
        />
        <Field
          label="E-POSTA"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          placeholder="ornek@eposta.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Field
          label="ŞİFRE"
          icon="key-outline"
          secure
          value={password}
          onChangeText={setPassword}
          placeholder="En az 6 karakter"
          autoComplete="new-password"
        />
        <Field
          label="ŞİFRE (TEKRAR)"
          icon="key-outline"
          secure
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Şifreni tekrar yaz"
          autoComplete="new-password"
          onSubmitEditing={submit}
        />

        {error && <ErrorNote text={error} />}

        <Button3D
          title={busy ? 'KAYDEDİLİYOR…' : 'KAYDOL'}
          onPress={submit}
          disabled={busy || !name || !email || !password || !confirm}
          style={styles.button}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Zaten bir hesabın var mı?</Text>
        <Link href="/login" asChild>
          <Pressable hitSlop={8}>
            <Text style={styles.footerLink}>Giriş yap</Text>
          </Pressable>
        </Link>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.space.lg },
  button: { marginTop: theme.space.sm },
  footer: { alignItems: 'center', marginTop: theme.space.xxl, gap: 4 },
  footerText: { fontFamily: theme.font.body, color: theme.color.fgDim, fontSize: 16 },
  footerLink: { fontFamily: theme.font.display, color: theme.color.accent, fontSize: 15 },
});
