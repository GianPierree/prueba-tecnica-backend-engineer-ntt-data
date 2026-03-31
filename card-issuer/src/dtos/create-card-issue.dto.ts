import { 
  IsString, 
  IsNotEmpty, 
  IsEmail, 
  IsInt, 
  Min, 
  IsIn, 
  IsBoolean, 
  ValidateNested, 
  IsDefined, 
  Matches
} from 'class-validator';
import { Type } from 'class-transformer';

class CustomerDto {
  @IsString()
  @IsIn(['DNI'], { message: 'El tipo de documento debe ser DNI' })
  documentType!: string;

  @IsString()
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  @Matches(/^\d{8}$/, { message: 'El DNI debe tener exactamente 8 dígitos numéricos' })
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