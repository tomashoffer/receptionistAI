import { ApiProperty } from '@nestjs/swagger';

export class GoogleCalendarEventDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  summary: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  start: {
    dateTime: string;
    timeZone: string;
  };

  @ApiProperty()
  end: {
    dateTime: string;
    timeZone: string;
  };

  @ApiProperty()
  attendees: Array<{
    email: string;
    displayName: string;
  }>;
}

export class GoogleSheetsRowDto {
  @ApiProperty()
  rowNumber: string;

  @ApiProperty()
  values: string[];
}

export class GoogleIntegrationStatusDto {
  @ApiProperty()
  calendarConnected: boolean;

  @ApiProperty()
  sheetsConnected: boolean;

  @ApiProperty()
  lastSync: Date;

  @ApiProperty()
  message: string;
}

