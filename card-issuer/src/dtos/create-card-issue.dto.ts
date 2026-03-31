import { 
  IsString, 
  IsNotEmpty, 
  IsEmail, 
  IsInt, 
  Min, 
  IsIn, 
  IsBoolean, 
  ValidateNested, 
  IsDefined 
} from 'class-validator';
import { Type } from 'class-transformer';

class CustomerDto {
  @IsString()
  @IsIn(['DNI', 'CE', 'RUC'], { message: 'El tipo de documento debe ser DNI, CE o RUC' })
  documentType!: string;

  @IsString()
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  documentNumber!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  fullName!: string;

  @IsInt({ message: 'La edad debe ser un número entero' })
  @Min(18, { message: 'El cliente debe ser mayor de 18 años' })
  age!: number;

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  email!: string;
}

class ProductDto {
  @IsString()
  @IsIn(['VISA'], { message: 'El tipo de producto solo puede ser VISA' })
  type!: string;

  @IsString()
  @IsIn(['PEN', 'USD'], { message: 'La moneda debe ser PEN o USD' })
  currency!: string;
}

export class CreateCardIssueDto {
  @IsDefined({ message: 'El objeto customer es requerido' })
  @ValidateNested()
  @Type(() => CustomerDto)
  customer!: CustomerDto;

  @IsDefined({ message: 'El objeto product es requerido' })
  @ValidateNested()
  @Type(() => ProductDto)
  product!: ProductDto;

  @IsBoolean({ message: 'forceError debe ser un valor booleano (true/false)' })
  forceError!: boolean;
}