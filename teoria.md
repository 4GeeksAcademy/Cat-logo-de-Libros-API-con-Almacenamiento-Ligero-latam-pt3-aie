## JWT - JSON TOKEN 

## AUTENTICACION  - verificar identidad
## AUTORIZACION  - verificar permisos para realizar acciones

## metodos de autenticar:
-usuario y contraseña 
-Oauth - delega la autentcacion del usuario a un tercero
-Biometrica 
-2FA -MFA
___

### API key
- ".env"

___

### TOKEN
- localStorage  (priorida)
- cookie httpOnly

## casos de prueba / respuestas comunes:

- usuario y contraseña ok -> "token" , 200
- usuario/contraseña incorrecta -> "error", 403 | 401 

**401** credenciales incorrectas
**403** sin autorizacion 

