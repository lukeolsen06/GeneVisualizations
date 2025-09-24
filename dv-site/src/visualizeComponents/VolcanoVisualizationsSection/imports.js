import DHS_DOHHvsTar4_EC_KEGG from "../../barCharts/DHS_DOHHvsTar4_EC/enrichment.KEGG.json";
import DHS_DOHHvsTar4_EC_RCTM from "../../barCharts/DHS_DOHHvsTar4_EC/enrichment.RCTM.json";
import DHS_DOHHvsTar4_EC_WikiPathways from "../../barCharts/DHS_DOHHvsTar4_EC/enrichment.WikiPathways.json";

import DHS_DOHHvsWT_EC_KEGG from "../../barCharts/DHS_DOHHvsWT_EC/enrichment.KEGG.json";
import DHS_DOHHvsWT_EC_RCTM from "../../barCharts/DHS_DOHHvsWT_EC/enrichment.RCTM.json";
import DHS_DOHHvsWT_EC_WikiPathways from "../../barCharts/DHS_DOHHvsWT_EC/enrichment.WikiPathways.json";

import EIf5A1_KEGG from "../../barCharts/eIF5A_DDvsDHS_DOHH/enrichment.KEGG.json";
import EIF5A1_RCTM from "../../barCharts/eIF5A_DDvsDHS_DOHH/enrichment.RCTM.json";
import EIF5A1_WikiPathways from "../../barCharts/eIF5A_DDvsDHS_DOHH/enrichment.WikiPathways.json";

import EIf5A2_KEGG from "../../barCharts/eIF5A_DDvseIF5A/enrichment.KEGG.json";
import EIF5A2_RCTM from "../../barCharts/eIF5A_DDvseIF5A/enrichment.RCTM.json";
import EIF5A2_WikiPathways from "../../barCharts/eIF5A_DDvseIF5A/enrichment.WikiPathways.json";

import EIf5A3_KEGG from "../../barCharts/eIF5A_DDvsK50A_DD/enrichment.KEGG.json";
import EIF5A3_RCTM from "../../barCharts/eIF5A_DDvsK50A_DD/enrichment.RCTM.json";
import EIF5A3_WikiPathways from "../../barCharts/eIF5A_DDvsK50A_DD/enrichment.WikiPathways.json";

import EIf5A4_KEGG from "../../barCharts/eIF5A_DDvsTar4_EC/enrichment.KEGG.json";
import EIF5A4_RCTM from "../../barCharts/eIF5A_DDvsTar4_EC/enrichment.RCTM.json";
import EIF5A4_WikiPathways from "../../barCharts/eIF5A_DDvsTar4_EC/enrichment.WikiPathways.json";

import EIf5A5_KEGG from "../../barCharts/eIF5A_DDvsWT_EC/enrichment.KEGG.json";
import EIF5A5_RCTM from "../../barCharts/eIF5A_DDvsWT_EC/enrichment.RCTM.json";
import EIF5A5_WikiPathways from "../../barCharts/eIF5A_DDvsWT_EC/enrichment.WikiPathways.json";

import EIf5A6_KEGG from "../../barCharts/eIF5AvsTar4_EC/enrichment.KEGG.json";
import EIF5A6_RCTM from "../../barCharts/eIF5AvsTar4_EC/enrichment.RCTM.json";
import EIF5A6_WikiPathways from "../../barCharts/eIF5AvsTar4_EC/enrichment.WikiPathways.json";

import EIf5A7_KEGG from "../../barCharts/eIF5AvsWT_EC/enrichment.KEGG.json";
import EIF5A7_RCTM from "../../barCharts/eIF5AvsWT_EC/enrichment.RCTM.json";
import EIF5A7_WikiPathways from "../../barCharts/eIF5AvsWT_EC/enrichment.WikiPathways.json";

import K501_KEGG from "../../barCharts/K50A_DDvsDHS_DOHH/enrichment.KEGG.json";
import K501_RCTM from "../../barCharts/K50A_DDvsDHS_DOHH/enrichment.RCTM.json";
import K501_WikiPathways from "../../barCharts/K50A_DDvsDHS_DOHH/enrichment.WikiPathways.json";

import K502_KEGG from "../../barCharts/K50A_DDvsTar4_EC/enrichment.KEGG.json";
import K502_RCTM from "../../barCharts/K50A_DDvsTar4_EC/enrichment.RCTM.json";
// import K502_WikiPathways from "../../barCharts/K50A_DDvsTar4_EC/enrichment.WikiPathways.json";

import K503_KEGG from "../../barCharts/K50A_DDvsWT_EC/enrichment.KEGG.json";
import K503_RCTM from "../../barCharts/K50A_DDvsWT_EC/enrichment.RCTM.json";
import K503_WikiPathways from "../../barCharts/K50A_DDvsWT_EC/enrichment.WikiPathways.json";

import Tar4_KEGG from "../../barCharts/Tar4_ECvsWT_EC/enrichment.KEGG.json";
import Tar4_RCTM from "../../barCharts/Tar4_ECvsWT_EC/enrichment.RCTM.json";
// import Tar4_WikiPathways from "../../barCharts/Tar4_ECvsWT_EC/enrichment.WikiPathways.json";

// import STRINGchart1 from "../../barCharts/DHS_DOHHvsTar4_EC/enrichment.NetworkNeighborAL.json";

import EIf5avsWTenrich from "../../barCharts/testNetwork/eIF5AvsWT_EC.all.Reactome_enrich";
console.log(EIf5avsWTenrich);
const plotDataMapping = {
  eIF5AvsWT_EC: {
    KEGG: DHS_DOHHvsWT_EC_KEGG,
    Reactome: EIf5avsWTenrich,
  },
};
const chartDataMapping = {
  DHS_DOHHvsWT_EC: {
    KEGG: DHS_DOHHvsWT_EC_KEGG,
    Reactome: DHS_DOHHvsWT_EC_RCTM,
    WikiPathways: DHS_DOHHvsWT_EC_WikiPathways,
  },
  DHS_DOHHvsTar4_EC: {
    KEGG: DHS_DOHHvsTar4_EC_KEGG,
    Reactome: DHS_DOHHvsTar4_EC_RCTM,
    WikiPathways: DHS_DOHHvsTar4_EC_WikiPathways,
    // AllGenes: STRINGchart1,
  },
  eIF5A_DDvsDHS_DOHH: {
    KEGG: EIf5A1_KEGG,
    Reactome: EIF5A1_RCTM,
    WikiPathways: EIF5A1_WikiPathways,
  },
  eIF5A_DDvseIF5A: {
    KEGG: EIf5A2_KEGG,
    Reactome: EIF5A2_RCTM,
    WikiPathways: EIF5A2_WikiPathways,
  },
  eIF5A_DDvsK50A_DD: {
    KEGG: EIf5A3_KEGG,
    Reactome: EIF5A3_RCTM,
    WikiPathways: EIF5A3_WikiPathways,
  },
  eIF5A_DDvsTar4_EC: {
    KEGG: EIf5A4_KEGG,
    Reactome: EIF5A4_RCTM,
    WikiPathways: EIF5A4_WikiPathways,
  },
  eIF5A_DDvsWT_EC: {
    KEGG: EIf5A5_KEGG,
    Reactome: EIF5A5_RCTM,
    WikiPathways: EIF5A5_WikiPathways,
  },
  eIF5AvsTar4_EC: {
    KEGG: EIf5A6_KEGG,
    Reactome: EIF5A6_RCTM,
    // Reactome: null,
    WikiPathways: EIF5A6_WikiPathways,
  },
  eIF5AvsWT_EC: {
    KEGG: EIf5A7_KEGG,
    Reactome: EIF5A7_RCTM,
    WikiPathways: EIF5A7_WikiPathways,
  },
  K50A_DDvsDHS_DOHH: {
    KEGG: K501_KEGG,
    Reactome: K501_RCTM,
    WikiPathways: K501_WikiPathways,
  },
  K50A_DDvsTar4_EC: {
    KEGG: K502_KEGG,
    Reactome: K502_RCTM,
    // WikiPathways: K502_WikiPathways,
    WikiPathways: null,
  },
  K50A_DDvsWT_EC: {
    KEGG: K503_KEGG,
    Reactome: K503_RCTM,
    // WikiPathways: null,
    WikiPathways: K503_WikiPathways,
  },
  Tar4_ECvsWT_EC: {
    KEGG: Tar4_KEGG,
    Reactome: Tar4_RCTM,
    // WikiPathways: Tar4_WikiPathways,
    WikiPathways: null,
  },
};

const dropdownOptions = [
  { label: "-- choose --" },
  { label: "MOCK_TEST" },
  { label: "DHS_DOHHvsWT_EC" },
  { label: "DHS_DOHHvsTar4_EC" },
  { label: "eIF5A_DDvsDHS_DOHH" },
  { label: "eIF5A_DDvseIF5A" },
  { label: "eIF5A_DDvsK50A_DD" },
  { label: "eIF5A_DDvsTar4_EC" },
  { label: "eIF5A_DDvsWT_EC" },
  { label: "eIF5AvsTar4_EC" },
  { label: "eIF5AvsWT_EC" },
  { label: "K50A_DDvsDHS_DOHH" },
  { label: "K50A_DDvsTar4_EC" },
  { label: "K50A_DDvsWT_EC" },
  { label: "Tar4_ECvsWT_EC" },
];

const DEGdropdownLength = "drop-down";

const dropdownTerms = [
  { label: "-- choose --", value: "-- choose --" },
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "50", value: 50 },
];
const termsLength = "terms";

export {
  chartDataMapping,
  // plotData,
  dropdownOptions,
  DEGdropdownLength,
  dropdownTerms,
  termsLength,
  plotDataMapping,
};
