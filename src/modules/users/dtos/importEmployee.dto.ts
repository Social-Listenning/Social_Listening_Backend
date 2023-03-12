export class ImportEmployeeDTO {
  userName: string;
  fullName: string;
  password: string;
  email: string;
  roleName: string;

  constructor(
    userName: string,
    fullName: string,
    password: string,
    email: string,
    roleName: string,
  ) {
    this.userName = userName;
    this.fullName = fullName;
    this.password = password;
    this.email = email;
    this.roleName = roleName;
  }
}
