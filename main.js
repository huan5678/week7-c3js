import axios from "axios";
import c3 from "c3";

const list = document.querySelector("#list");
const selectFilter = document.querySelector("#location");
const ticketForm = document.querySelector("#ticketForm");
const filterSelect = document.querySelector("#filterResult");

let data = [];

let str = "";

const clearForm = () => {
  ticketForm.reset();
};

const filterResult = (e) => {
  const filter = e;

  if (filter === "全部" || filter === "" || filter === undefined) {
    filterSelect.innerHTML = `本次搜尋共 ${data.length} 筆資料`;
    return render(data);
  } else {
    const filteredData = data.filter((item) => item.area === filter);
    filterSelect.innerHTML = `本次搜尋共 ${filteredData.length} 筆資料`;
    return render(filteredData);
  }
};

selectFilter.addEventListener("change", (e) => {
  filterResult(e.target.value);
});

ticketForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(ticketForm);
  const name = formData.get("ticketName");
  const area = formData.get("attractions");
  const description = formData.get("ticketDesc");
  const group = formData.get("ticketAmount");
  const price = formData.get("ticketPrice");
  const rate = formData.get("ticketRate");
  const imgUrl = formData.get("imgUrl");
  const newData = {
    id: data.length + 1,
    name: name,
    imgUrl: imgUrl,
    area: area,
    description: description,
    group: group,
    price: price,
    rate: rate,
  };
  // https://picsum.photos/500/300
  const urlRegex = new RegExp(
    /^(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+[a-zA-Z]+)(:\d+)?(\/.*)?(\?.*)?(#.*)?$/
  );
  if (!urlRegex.test(imgUrl)) {
    alert("請輸入正確的網址");
    return;
  }
  if (description === "") {
    newData.description = "使用者很懶沒有留下任何訊息";
  }
  if (rate === "") {
    newData.rate = 0;
  }
  console.log(formData);
  console.log(name, price, rate, imgUrl, area, description, group);
  data.push(newData);
  render(data);
  calculatorChartData(data);
  store(data);
  clearForm();
  filterResult();
});

const render = (Array) => {
  str = "";
  Array.forEach((item) => {
    str += `
        <li class="bg-white shadow border rounded border-[#DEE2E6] md:w-1/2 lg:w-4/12 max-w-[80vw] md:max-w-[300px] lg:max-w-[350px] flex flex-col" data-key="${item.id}">
          <div class="relative">
            <div class="rounded-t overflow-hidden">
              <picture>
                <source media="(min-width: 768px)" srcset="${item.imgUrl}" class="duration-500 hover:scale-[105%] origin-center object-fill">
                <img src="${item.imgUrl}" alt="ticket01" class="duration-500 hover:scale-[105%] origin-center object-fill">
              </picture>
            </div>
            <span class="absolute top-0 -translate-y-1/3 bg-secondary text-white py-2 px-5 rounded-r">${item.area}</span>
            <span class="absolute bottom-0 translate-y-1/2 bg-primary text-white py-1 px-2">${item.rate}</span>
          </div>
          <div class="p-5 flex flex-col h-full">
            <h2 class="text-primary border-bottom border-primary font-medium text-2xl pb-1 border-b-2 mb-4">${item.name}</h2>
            <p class="text-gray mb-6 flex-1">${item.description}</p>
            <div class="flex justify-between items-center text-primary">
              <div class="flex items-center">
                <i class="bi bi-exclamation-circle-fill mr-2"></i>
                <p class="font-medium">剩下最後 ${item.group} 組</p>
              </div>
              <div class="flex items-center">
                <span class="text font-medium mr-1">TWD</span>
                <span class="text-2xl font-roboto font-medium">$${item.price}</span>
              </div>
            </div>
          </div>
        </li>
`;
  });

  list.innerHTML = str;
};

const chartData = {
  columns: [],
  colors: {
  },
}

const chart = (columns, colors) => c3.generate({
      data: {
        columns: [...columns],
        type: "donut",
      },
      donut: {
        title: "套票各地區所佔比重",
      },
      colors: { ...colors },
    });

const areaNameList = document.querySelectorAll("#attractions > option");
const optionKey = [];
areaNameList.forEach((item) => {
  if (item.value !== "") {
    optionKey.push(item.value);
  }
});
const chartDataInit = (data) => {
  data.forEach((item,idx) => {
    chartData.columns.push([optionKey[idx], 0]);
    if (chartData.colors[optionKey[idx]] === undefined) {
      chartData.colors[optionKey[idx]] =
        `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }
  })
  // console.log(chartData);
}

const calculatorChartData = (data) => {
  const areaData = {};
  data.forEach((item) => {
    if (areaData[item.area] === undefined) {
      areaData[item.area] = 0;
    }
    areaData[item.area]++;
  });
  chartData.columns.forEach((item, idx) => {
    item[1] = areaData[item[0]];
  });
  chart(chartData.columns, chartData.colors);
};


//store local storage
const store = (data) => {
  localStorage.setItem("ticketData", JSON.stringify(data));
};

const init = () => {
  chartDataInit(optionKey);
  axios
    .get(
      "https://raw.githubusercontent.com/hexschool/js-training/main/travelApi.json"
    )
    .then((res) => {
      data = res.data.data;
      calculatorChartData(data);
      filterResult();
      let localData;
      localData = JSON.parse(localStorage.getItem("ticketData"));
      if (localData === null || localData.length === 0 || localData === undefined) {
        localData = [];
      }
      if (localData.length > data.length) {
        data = localData;
      }
        render(data);
        calculatorChartData(data);
        store(data);
    })
    .catch((err) => {
      console.error(err);
    });
};

init();
