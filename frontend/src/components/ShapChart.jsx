import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ShapChart = ({ shapReport }) => {
    if (!shapReport) {
      console.error("Brak raportu SHAP do wizualizacji.");
      return null;
    }
  
    const shapLines = shapReport.split("\n");
    console.log("Przetwarzane linie SHAP:", shapLines);
  
    const startIndex = shapLines.findIndex((line) =>
      line.includes("Szczegółowy wpływ cech na wynik:")
    );
    const relevantLines = startIndex !== -1 ? shapLines.slice(startIndex + 1) : [];
  
    console.log("Przetwarzane linie po odfiltrowaniu:", relevantLines);
  
    const features = [];
    const impacts = [];
  
    relevantLines.forEach((line) => {
      if (line.includes(":")) {
        const [featurePart, impactPart] = line.split(":").map((part) => part.trim());
        const match = impactPart.match(/[0-9]*\.?[0-9]+/);
        if (match) {
          features.push(featurePart.slice(2));
          const value = parseFloat(match[0]);
          impacts.push(impactPart.includes("zmniejsza") ? -value : value);
        }
      }
    });    
  
    console.log("Features:", features);
    console.log("Impacts:", impacts);
  
    if (features.length === 0 || impacts.length === 0) {
      console.error("Nie udało się wyodrębnić danych z raportu SHAP.");
      return null;
    }
  
    const data = {
      labels: features,
      datasets: [
        {
          label: "Wpływ cech na predykcję",
          data: impacts,
          backgroundColor: impacts.map((value) => (value > 0 ? "#4CAF50" : "#F44336")),
          borderColor: "#333",
          borderWidth: 1,
        },
      ],
    };
  
    const options = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Wpływ cech na predykcję",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Wpływ cech",
          },
        },
      },
    };
  
    return <Bar data={data} options={options} />;
  };
  
  export default ShapChart;
  