const time = (time) => {
  const date = new Date(time);
  let formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return formattedTime.replace(" a.m.", "AM").replace(" p.m.", " PM");
};

export default time;
