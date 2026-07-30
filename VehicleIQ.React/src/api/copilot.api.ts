import axiosClient from './axiosClient';
import type { CopilotChatRequest, CopilotResponse } from '../types';

export const sendCopilotMessage = async (request: CopilotChatRequest): Promise<CopilotResponse> => {
  const { data } = await axiosClient.post<CopilotResponse>('/copilot/chat', request);
  return data;
};
