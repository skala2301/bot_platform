import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  ModelInfo,
  ModelLocation,
  ModelType,
  ModelSelection,
} from '../../interfaces/bots/model.interface';
import { Bot } from '../../interfaces/bots/bot.interface';

@Injectable({ providedIn: 'root' })
export class ModelApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl: string = 'http://localhost:8000/api/v1';

  listModels(
    modelLocation: ModelLocation,
    modelType: ModelType = 'chat'
  ): Promise<ModelInfo[]> {
    const params = new HttpParams()
      .set('model_location', modelLocation)
      .set('model_type', modelType);
    return firstValueFrom(
      this.http.get<ModelInfo[]>(`${this.baseUrl}/models`, { params })
    );
  }

  selectBotModel(botUid: string, selection: ModelSelection): Promise<Bot> {
    return firstValueFrom(
      this.http.post<Bot>(
        `${this.baseUrl}/bots/${botUid}/model/select`,
        selection
      )
    );
  }
}
