# 🔐 Directorio de Keystores

Este directorio contiene los keystores necesarios para firmar la aplicación Victus.

## 📋 Archivos

- `debug.keystore` - Keystore para desarrollo (generado automáticamente)
- `victus-release-key.keystore` - Keystore para producción (generado manualmente)

## ⚠️ Seguridad

**IMPORTANTE**: Los keystores contienen información sensible y no deben ser incluidos en el control de versiones.

- ✅ Estos archivos están en `.gitignore`
- ✅ Haz backup de los keystores de producción
- ❌ NUNCA compartas las contraseñas de los keystores

## 🔧 Uso

Para generar un nuevo keystore de producción:

```bash
npm run keystore:generate
```

Para verificar un APK firmado:

```bash
npm run apk:verify
```

## 📖 Documentación

Ver `SIGNING_GUIDE.md` para más detalles sobre el proceso de firma.
