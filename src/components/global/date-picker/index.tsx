import React, { useCallback } from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Text from '@/components/ui/Text';
import Button from '../button';

interface DatePickerProps {
    value: Date | null;
    onChange: (date: Date) => void;
    onClose: () => void;
    maxDate?: Date;
    minDate?: Date;
    visible?: boolean;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    onClose,
    maxDate = new Date(),
    minDate = new Date(1900, 0, 1),
    visible = false,
}) => {
    const handleDayPress = useCallback((day: any) => {
        onChange(new Date(day.timestamp));
    }, [onChange]);

    const markedDates = value ? {
        [value.toISOString().split('T')[0]]: {
            selected: true,
            selectedColor: '#E6F5F0',
            selectedTextColor: '#34AA87'
        }
    } : {};

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white p-5 pb-8">
                    <Calendar
                        onDayPress={handleDayPress}
                        markedDates={markedDates}
                        maxDate={maxDate.toISOString().split('T')[0]}
                        minDate={minDate.toISOString().split('T')[0]}
                        hideExtraDays={true}
                        enableSwipeMonths={true}
                        theme={{
                            backgroundColor: '#ffffff',
                            calendarBackground: '#ffffff',
                            textSectionTitleColor: '#6B7280',
                            selectedDayBackgroundColor: '#E6F5F0',
                            selectedDayTextColor: '#34AA87',
                            todayTextColor: '#34AA87',
                            dayTextColor: '#111827',
                            textDisabledColor: '#d9e1e8',
                            dotColor: '#34AA87',
                            monthTextColor: '#111827',
                            textMonthFontWeight: '600',
                            textDayFontWeight: '400',
                            textDayFontSize: 16,
                            textMonthFontSize: 18,
                            textDayHeaderFontSize: 14,
                            textDayHeaderFontWeight: '500',
                            arrowColor: '#444444',
                            'stylesheet.calendar.header': {
                                monthText: {
                                    fontSize: 18,
                                    fontWeight: '600',
                                    color: '#111827',
                                    margin: 20,
                                },
                                arrow: {
                                    padding: 10,
                                    color: '#444444'
                                }
                            },
                            'stylesheet.calendar.main': {
                                week: {
                                    marginTop: 6,
                                    marginBottom: 6,
                                    flexDirection: 'row',
                                    justifyContent: 'space-around',
                                },
                                dayContainer: {
                                    borderRadius: 0,
                                    width: 50,
                                    height: 50,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }
                            },
                            'stylesheet.calendar.day': {
                                base: {
                                    width: 50,
                                    height: 50,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 0,
                                },
                                selected: {
                                    backgroundColor: '#E6F5F0',
                                    borderRadius: 0,
                                }
                            }
                        }}
                        renderHeader={(date: string) => {
                            const month = new Date(date).getMonth();
                            return (
                                <Text weight="medium" className="text-lg text-gray-900">
                                    {MONTHS[month]}
                                </Text>
                            );
                        }}
                        renderDay={(day: { dateString: string; day: number }) => {
                            const isSelected = value && day.dateString === value.toISOString().split('T')[0];
                            return (
                                <View
                                    className={`w-[52px] h-[44px] items-center justify-center rounded-lg ${isSelected ? 'bg-[#E6F5F0]' : 'bg-transparent'
                                        }`}
                                >
                                    <Text
                                        className={`text-base ${isSelected ? 'text-[#34AA87]' : 'text-[#111827]'
                                            }`}
                                    >
                                        {day.day}
                                    </Text>
                                </View>
                            );
                        }}
                    />

                    {/* Bottom Buttons */}
                    <View className="flex-row justify-end items-center gap-5 mt-5">
                        <TouchableOpacity
                            onPress={onClose}
                            className='bg-transparent border-none'
                        >
                            <Text weight="regular" className="text-tc-primary font-medium text-center text-sm">
                                Close
                            </Text>
                        </TouchableOpacity>
                        <Button
                            onPress={onClose}
                            size='sm'
                            className='w-[75px]'
                        >
                            Done
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default DatePicker; 