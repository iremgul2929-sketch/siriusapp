import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthShell } from '@/components/AuthShell';
import { Field } from '@/components/Field';
import { Button3D } from '@/components/Button3D';
import { ErrorNote } from '@/components/ErrorNote';

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(await login(email, password));
    setBusy(false);
  };

  return (
    <AuthShell title="Giriş Yap" subtitle="Kaldığın yerden öğrenmeye devam et">
      <View style={styles.form}>
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
          placeholder="••••••"
          autoComplete="password"
          onSubmitEditing={submit}
        />

        {error && <ErrorNote text={error} />}

        <Button3D
          title={busy ? 'KONTROL EDİLİYOR…' : 'GİRİŞ YAP'}
          onPress={submit}
          disabled={busy || !email || !password}
          style={styles.button}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Henüz öğrenci değil misin?</Text>
        <Link href="/register" asChild>
          <Pressable hitSlop={8}>
            <Text style={styles.footerLink}>Hesap oluştur</Text>
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
