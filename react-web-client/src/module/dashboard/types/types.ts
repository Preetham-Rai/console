export interface IPropType {
    name: string;
    age: number;
    mutateProp?: (data: any) => void
}