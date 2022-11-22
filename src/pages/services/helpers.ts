const getLocaleDate = (stringDate?: string, isHoursDisplayed = false, isMinutesDisplayed = false): string | null => {
    if (!stringDate) return null;
    const dateWithOff = new Date(stringDate);
    
    const date = new Date( dateWithOff.getTime() + Math.abs(dateWithOff.getTimezoneOffset()*60000) )
    
    var a = date.toLocaleDateString('en-us', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: isHoursDisplayed ? '2-digit' : undefined,
      minute: isMinutesDisplayed ? '2-digit' : undefined,
    });
   
    return a;
  };
  
  export default getLocaleDate;