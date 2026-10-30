import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dominioDeCorreo,
  esDominioPermitido,
  requisitosContrasena,
  validarConfirmacion,
  validarContrasenaNueva,
  validarCorreoInstitucional,
  validarNombre,
} from '../src/features/autenticacion/domain/validacion.ts';

const permitidos = ['edu.ec'];

test('acepta correos de cualquier universidad con dominio edu.ec', () => {
  for (const correo of ['ana@espol.edu.ec', ' Ana.Torres@ESPOL.EDU.EC ', 'x@est.ups.edu.ec']) {
    assert.equal(validarCorreoInstitucional(correo, permitidos), null, correo);
  }
});

test('rechaza correos que no son universitarios', () => {
  for (const correo of ['ana@gmail.com', 'ana@edu.ec', 'ana@espol.edu.ec.com', 'ana@espoledu.ec']) {
    assert.match(validarCorreoInstitucional(correo, permitidos) ?? '', /\.edu\.ec/, correo);
  }
});

test('informa formato inválido y campo vacío', () => {
  assert.match(validarCorreoInstitucional('', permitidos), /Ingresa/);
  assert.match(validarCorreoInstitucional('ana@', permitidos), /formato/);
  assert.equal(dominioDeCorreo('sin-arroba'), null);
});

test('el sufijo exige un nivel anterior', () => {
  assert.equal(esDominioPermitido('espol.edu.ec', permitidos), true);
  assert.equal(esDominioPermitido('edu.ec', permitidos), false);
});

test('valida los requisitos de la contraseña', () => {
  assert.deepEqual(
    requisitosContrasena('abc').map((requisito) => requisito.cumple),
    [false, true, false]
  );
  assert.equal(validarContrasenaNueva('findyp2026'), null);
  assert.match(validarContrasenaNueva('soloLetras') ?? '', /número/);
});

test('valida confirmación y nombre', () => {
  assert.equal(validarConfirmacion('abc12345', 'abc12345'), null);
  assert.match(validarConfirmacion('abc12345', 'abc') ?? '', /no coinciden/);
  assert.match(validarNombre('Al') ?? '', /3 caracteres/);
  assert.equal(validarNombre('Ana Torres'), null);
});
