# A Narrative of Global COVID-19 Cases  

Name: Xin Deng  
NetID: xind5

## 1. Messaging

The purpose of this visualization is to help users understand the global development of COVID-19 from a big picture to detailed country patterns. I wanted to show how the pandemic started, how it spread worldwide, and how different countries experienced different trends. The story moves from a global trend to regional data and finally to individual countries. My goal is to let users explore and compare the data by themselves after getting the main message.

## 2. Narrative Structure

I chose the martini glass structure for this project. The first part of the visualization gives an overview using a global line chart. Although it does not require input from the user, it includes annotations that respond to mouse actions. Then, in the second part, the user can pick a date to explore the global distribution of confirmed cases using a world map. The third part allows the user to focus on a specific country and see the historical trend.

## 3. Visual Structure

There are three main scenes. Each one uses a different type of chart to support the story. The global line chart shows the overall growth of cases since 2020. It uses a simple line with time and total confirmed cases. The second scene uses a map to show country-level confirmed cases on any selected date, using a red color scale to show severity. The third part is another line chart, but it shows the history of a selected country, with the ability to change the country. These three scenes help users see the trend globally, geographically, and locally.

## 4. Scenes

The first scene is the global confirmed cases line chart from 2020 to 2024. The second scene is the interactive map. Users can choose the date to see how the virus spread around the world.
The third scene is a country-specific line chart. The user can select a country from the dropdown or by clicking the map, and the chart updates automatically. 
Each scene is connected to the next in a logical order. The design goes from overall to specific.

## 5. Annotations

I added annotations to the first line chart to emphasize key points in the global pandemic timeline. There are red dots for important dates, like the WHO pandemic declaration (March 2020), the first vaccine rollout (December 2020), the Omicron surge (January 2022), and the end of global emergency (May 2023). These annotations appear when the user hovers the mouse over the red dots, which keeps the chart clean but still gives meaningful context to the trend.

In the second part, when the user hovers over a country on the map, a tooltip appears showing the country name and the number of confirmed cases (e.g., “Canada: 4,601,219 cases”). This helps users get quick and detailed information without clicking, and adds interactivity and clarity to the geographic data.

## 6. Parameters

The main parameters used in my visualization are the selected date and the selected country. The selected date controls the data shown on the map and updates the title. The selected country controls which country's data is shown in the third chart. These parameters are stored in JavaScript and updated using event listeners. 

## 7. Triggers

The triggers in my visualization are the date picker, the country dropdown, and the map click. These trigger changes in the selected date or country, which then update the related visualizations. For example, if the user clicks a country on the map, it updates the third chart with that country’s data. If the user picks a new date, the map updates immediately. These triggers are implemented using D3's `on("change")` and `on("click")` functions.