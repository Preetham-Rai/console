export type InputTypes = 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea' | 'date'

export interface FieldTypes {
    type: InputTypes;
    name: string;
    label?: string;
    placeholder?: string;
    rules?: any; // validation 
    props?: any;
    options?: {
        label: string;
        value: string | number
    }[];
    defaultValue?: any
    visible?: (values: any) => boolean;
}