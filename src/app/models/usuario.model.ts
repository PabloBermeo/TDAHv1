export class UsuarioModel{
    email:string;
    password:string;
    nombre: string;
    edad?:number;
}
export class PacienteModel{
    creadoPor?:string;
    idPaciente: string;
    nombre:string;
    edad?:number;
    sexo: string;
    fecha_creacion:Date;
    n_evaluaciones:number=0;
}