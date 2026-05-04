import { IsNumber, IsString } from "class-validator";

export class CreateHistoryDto {
    @IsNumber()
    user_id: number
    
    @IsString()
    query_text: string
}
