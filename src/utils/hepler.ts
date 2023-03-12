import { plainToClass, Transform } from 'class-transformer';
import { ClassType } from 'class-transformer-validator';

export function plainToClassCustom<T>(cls: ClassType<T>, plain: object): T {
  class InsensitiveDto {
    [key: string]: any;

    constructor(input: object) {
      const exampleData = new cls();
      const listKey = Object.getOwnPropertyNames(exampleData);
      Object.entries(input).forEach(([k, v]) => {
        const propertyKey = listKey.find(
          (key) => key.toLowerCase() === k.toLowerCase(),
        );
        if (propertyKey) {
          this[propertyKey] = v;
        }
      });
    }
  }

  Object.getOwnPropertyNames(cls.prototype).forEach((prop) => {
    Transform((plainObj) => plainObj[prop.toLowerCase() || prop])(
      InsensitiveDto.prototype,
      prop,
    );
  });

  const dto = new InsensitiveDto(plain);
  return plainToClass(cls, dto);
}

export class Helper {
  public static getFileName(fileName: string) {
    const listAttr = fileName.split('.');
    listAttr.pop();
    return listAttr.join('.');
  }

  public static getFileExtension(fileName: string) {
    const mimetype = fileName.split('.').pop();
    return mimetype;
  }
}
