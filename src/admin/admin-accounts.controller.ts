import { Controller } from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth } from '@nestjs/swagger';

@Controller('api/v1/admin')
@ApiUseTags('admin-accounts')
@ApiBearerAuth()
export class AdminAccountsController {

}
