import { Body, Controller, Get, NotFoundException, Put } from '@nestjs/common';
import { SettingService } from '../service/setting.service';
import { QuerySettingDTO } from '../dto/querySetting.dto';
import { UpdateSettingDTO } from '../dto/updateSetting.dto';

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get('getAllSetting')
  async getAllSetting() {
    return await this.settingService.getAllSetting();
  }

  @Get('getSettingByKeyAndGroup')
  async getDatailSetting(@Body() settingData: QuerySettingDTO) {
    const setting = await this.settingService.getSettingByKeyAndGroup(
      settingData.key,
      settingData.group,
    );
    if (!setting) {
      throw new NotFoundException(
        `Not found setting with key ${settingData.key} and group ${settingData.group}`,
      );
    }

    return setting;
  }

  @Put('editSetting')
  async updateSetting(@Body() updateSettingData: UpdateSettingDTO) {
    const setting = await this.settingService.getSettingByKeyAndGroup(
      updateSettingData.key,
      updateSettingData.group,
    );
    if (!setting) {
      throw new NotFoundException(
        `Not found setting with key ${updateSettingData.key} and group ${updateSettingData.group}`,
      );
    }

    return await this.settingService.updateSetting(updateSettingData);
  }
}
