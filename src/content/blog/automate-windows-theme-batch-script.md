---
title: "Automate Windows theme changes by time with a batch script"
description: "A tiny Windows automation that flips between light and dark themes on a schedule using a batch script and the registry."
date: 2023-11-13
category: tutorial
tags:
  - automation
  - windows
  - scripting
cover: /images/windows-theme-cover.svg
coverAlt: "A day-to-night theme switch"
---

Lets try to automate the auto-theme change in windows using dll's

Why you ask?

_Well nothing much, I just need an excuse to learn and know how and where dll's can be used in windows_
So starting we do the most basic stuff which is solve our daily issues.<br/>
One of my such issues is I want light windows theme during day time and dark theme in night time, so I am trying to automate this process.

Lets get started, shall we...

```batch
@echo off
setlocal enabledelayedexpansion
```

- `@echo off`: This command disables command echoing, which prevents the console from displaying the actual commands. To make the output of batch scripts cleaner, it is frequently used at the start of the script.

- `setlocal enabledelayedexpansion`: This command enables delayed variable expansion. It's necessary when using variables inside a block of code (inside parentheses), as it allows you to access the updated values of variables within the block. In this script, it's used within the `for` loop to update the `current_hour` variable.

```batch
rem Get the current time in hours (24-hour format)
for /f "tokens=1,2 delims=:" %%a in ("%time%") do (
    set /a "current_hour=%%a"
)
```

- `rem`: This is a comment or remark. It's used to insert comments into the batch script that describe what a certain piece of code accomplishes. It serves as a sign that we are receiving the current time in this instance.

- `for /f "tokens=1,2 delims=:" %%a in ("%time%") do ...`: This `for` loop is used to split the current time (in the format HH:MM:SS.ss) and extract the hour (HH) part. It uses `:` as the delimiter, and the `tokens=1,2` option specifies which parts of the string to capture.

- `set /a "current_hour=%%a"`: This line assigns the extracted hour to the `current_hour` variable. The `/a` option tells the `set` command to treat the right-hand side as an arithmetic expression.

```batch
rem Set the time ranges for theme changes
set morning_start=6
set morning_end=11
set afternoon_start=12
set afternoon_end=17
set evening_start=18
set evening_end=23
```

- Here, we define time ranges for when different themes should be applied. The script considers the morning (6 AM - 11 AM), afternoon (12 PM - 5 PM), and evening (6 PM - 11 PM) periods. These time ranges are stored in variables like `morning_start`, `morning_end`, etc.

```batch
rem Choose the theme based on the current time
if !current_hour! geq %morning_start% if !current_hour! leq %morning_end% (
    reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" /v AppsUseLightTheme /t REG_DWORD /d 1 /f
) else if !current_hour! geq %afternoon_start% if !current_hour! leq %afternoon_end% (
    reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" /v AppsUseLightTheme /t REG_DWORD /d 1 /f
) else if !current_hour! geq %evening_start% if !current_hour! leq %evening_end% (
    reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" /v AppsUseLightTheme /t REG_DWORD /d 0 /f
)
```

- Here, the script checks the `current_hour` against the defined time ranges for the different parts of the day. If the current hour falls within a specified range, it uses the `reg` command to change the Windows theme settings.

- The `reg add` command modifies the Windows Registry. In this example, it sets the "AppsUseLightTheme" value under the "Personalize" key to 1 (for light theme) during the morning and afternoon, and 0 (for dark theme) in the evening. The `/t REG_DWORD` option specifies the data type as a DWORD.

```batch
rem Trigger a theme change
rundll32.exe %SystemRoot%\System32\shell32.dll,Control_RunDLL %SystemRoot%\System32\desk.cpl desk,@Themes /Action:OpenTheme /file:"Path\To\Your\Theme"
```

- Finally, the script uses `rundll32.exe` to open the Windows theme control panel. This line of code triggers a theme change based on the specified theme file path. Be sure to replace `"Path\To\Your\Theme"` with the actual path to the theme file you want to apply.

This batch script, which can be manually run or scheduled to run at predetermined periods, automates the process of changing the Windows theme dependent on the time of day.

---

*Originally published on [dev.to](https://dev.to/vijay2249/automate-windows-theme-changes-based-on-time-with-a-batch-script-57li).*
