FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["VehicleIQ.API.csproj", "./"]
RUN dotnet restore "VehicleIQ.API.csproj"

COPY . .
RUN dotnet build "VehicleIQ.API.csproj" -c Release -o /app/build
RUN dotnet publish "VehicleIQ.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "VehicleIQ.API.dll"]
