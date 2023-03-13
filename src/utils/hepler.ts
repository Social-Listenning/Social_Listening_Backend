import { plainToClass, Transform } from 'class-transformer';
import { ClassType } from 'class-transformer-validator';

export function plainToClassCustom<T>(
  cls: ClassType<T>,
  plain: object,
  mapping: any[],
): T {
  class InsensitiveDto {
    [key: string]: any;

    constructor(input: object) {
      Object.entries(input).forEach(([k, v]) => {
        const propertyKey = mapping.find((key) => key.header === k)?.props;
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
