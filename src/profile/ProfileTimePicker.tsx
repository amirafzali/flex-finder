import * as React from 'react';
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import TimePicker from '@mui/lab/TimePicker';

type ProfileTimePickerProps = {
  initialValue: number,
  label: string,
  identifier: string,
  onChange: Function,
}

export default function ProfileTimePicker({initialValue, label, identifier, onChange}: ProfileTimePickerProps) {
  // let val = initialValue;
  
  const date = new Date(`1995-12-17T${initialValue}:00:00`);
  const [value, setValue] = React.useState<Date>(date);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TimePicker
        label={label}
        value={date} 
        onChange={(newValue) => {
          if (newValue !== null){
            const hour = parseInt(newValue.toString().split(" ")[4].split(":")[0]);
            setValue(newValue);
            onChange(identifier, hour);
          }
        }}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
}

export interface TimeslotObject {
    day: string,
    start_time: string,
    end_time: string,
}
