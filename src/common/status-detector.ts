export interface VitalsInput {
  HeartRate: number;
  SpO2: number;
  TempC: number;
  GSR: number;
  LSM_AccX: number;
  LSM_AccY: number;
  LSM_AccZ: number;
}

export interface StatusResult {
  HR_Status: string;
  SpO2_Status: string;
  Temp_Status: string;
  Stress_Level: string;
  Movement_Status: string;
}

export function detectStatus(data: VitalsInput): StatusResult {
  const hr = data.HeartRate;
  const spo2 = data.SpO2;
  const temp = data.TempC;
  const gsr = data.GSR;
  const x = data.LSM_AccX;
  const y = data.LSM_AccY;
  const z = data.LSM_AccZ;

  const magnitude = Math.sqrt(x * x + y * y + z * z);

  const HR_Status = hr < 60 ? 'Low' : hr > 100 ? 'High' : 'Normal';

  const SpO2_Status = spo2 < 90 ? 'Critical' : spo2 < 95 ? 'Low' : 'Normal';

  const Temp_Status = temp < 35 ? 'Low' : temp > 38 ? 'High' : 'Normal';

  const Stress_Level =
    gsr < 0.3 ? 'Relaxed' : gsr < 0.7 ? 'Moderate' : 'High Stress';

  const Movement_Status =
    magnitude < 0.5
      ? 'Free Fall'
      : magnitude > 2.5
        ? 'Impact'
        : magnitude > 1.5
          ? 'Abnormal'
          : 'Normal';

  return { HR_Status, SpO2_Status, Temp_Status, Stress_Level, Movement_Status };
}
