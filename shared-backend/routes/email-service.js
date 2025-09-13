const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');

// Email template configurations
const EMAIL_CONFIG = {
  brand: {
    name: 'Clutch',
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjcxIiBoZWlnaHQ9IjI3MSIgdmlld0JveD0iMCAwIDI3MSAyNzEiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMjcuMzc4IDI3MC42ODFDMTIzLjQ4MSAyNzAuNDU1IDExNy40OTQgMjY5LjgzNSAxMTMuOTkzIDI2OS4yN0wxMDcuNjY3IDI2OC4zMTFMMTIzLjI1NSA0NDkuOTU4TDEzOC44NDQgMjIxLjY2TDE0Mi4wMDcgMjIxLjMyMkMxNTEuNDM5IDIyMC4zNjMgMTYxLjk0NCAyMTcuNzY4IDE2OS4zNDMgMjE0LjYwOUwxNzEuNDg5IDIxMy42NUwxNzEuMjA3IDIxNS41MTJDMzE3MS4wMzcgMjE2LjUyNyAxNzAuMjQ3IDIyOC40ODYgMTY5LjM5OSAyNDIuMDgxTDE2Ny44MTggMjY2LjczMkwxNjUuNTU5IDI2Ny4zNTJDMTYxLjA0IDI2OC41OTMgMTUxLjA0MyAyNzAuMTE3IDE0NS41NjUgMjcwLjM5OUMxNDIuNTcxIDI3MC41NjggMTM4Ljg0NCAyNzAuNzkzIDEzNy4yNjIgMjcwLjkwNkMxMzUuNzM3IDI3MC45NjMgMTMxLjI3NSAyNzAuOTA2IDEyNy4zNzggMjcwLjY4MVoiIGZpbGw9IiNFRDFCMjQiLz4KPHBhdGggZD0iTTkwLjE1ODMgMjYzLjA2NUM3Ni42NTk2IDI1OC4zMjcgNjIuMjU3MiAyNTAuMjYgNTAuNjc4OCAyNDAuOTUzTDQ1LjM2OTYgMjM2LjcyMkw3MC4zMzM4IDIyNC4zNjhDODQuMTE1IDIxNy41OTkgOTUuNTgwNCAyMTIuMDE0IDk1Ljg2MjggMjEyLjAxNEM5Ni4xNDUyIDIxMi4wMTQgOTcuNzgzMiAyMTIuNzQ4IDk5LjU5MDUgMjEzLjY1QzEwNC4yNzggMjE2LjAxOSAxMTQuNjcxIDIxOS4xNzggMTIxLjQ0OCAyMjAuMjVMMTI3LjM3OSAyMjEuMjA5TDEyNi40MTkgMjIyLjY3NkMxMTguOTYzIDIzNC4xODMgOTcuNzI2NyAyNjUuNjA0IDk3LjUwMDggMjY1LjU0N0M5Ny4zMzEzIDI2NS41NDcgOTMuOTk5IDI2NC40MTkgOTAuMTU4MyAyNjMuMDY1WiIgZmlsbD0iI0VEMUIyNCIvPgo8cGF0aCBkPSJNMTc3LjgxNSAyNjEuNTk5QzE3Ny45ODUgMjYwLjI0NSAxNzguODMyIDI0Ny43MjIgMTc5LjczNiAyMzMuNzg4TDE4MS4zMTcgMjA4LjQwNEwxODMuODAyIDIwNi43MTJDMjE5MC45NzUgMjAxLjc0OCAxOTguODgyIDE5NC4yNDUgMjAzLjg1MyAxODcuNjQ1TDIwNS4zNzggMTg1LjU1OEwyMTcuMjk1IDIwOS4zNjNMMjI5LjE1NiAyMzMuMTY4TDIyNi4xMDYgMjM1Ljg3NkMyMTQuNDcxIDI0Ni4zMTEgMTk5LjMzNCAyNTUuNzMyIDE4NS4yNzEgMjYxLjI2QzE3Ny4wMjUgMjY0LjQ3NSAxNzcuNDIgMjY0LjQ3NSAxNzcuODE1IDI2MS41OTlaIiBmaWxsPSIjRUQxQjI0Ii8+CjxwYXRoIGQ9Ik0zNC41MjU1IDIyNS44MzVDMjUuODg0MSAyMTYuMDc2IDE4LjgyNCAyMDUuMzU4IDEzLjI4OSAxOTMuNzk0QzEwLjIzOTEgMTg3LjQxOSA2Ljg1MDI3IDE3OC43ODkgNy4xODkxNSAxNzguMzk0QzcuMzAyMTEgMTc4LjMzNyAxOS43ODQyIDE3OS4wNzEgMzQuOTc3MyAxODAuMDNMNjIuNTk2MSAxODEuODM1TDY2LjU0OTcgMTg3LjE5NEM3MC44OTg3IDE5My4wMDQgNzcuNTA2OCAxOTkuODMgODIuNDIwNiAyMDMuNTUzTDg1LjUyNyAyMDUuODY1TDYxLjgwNTQgMjE3LjcxMkM0OC43NTg1IDIyNC4xOTkgMzguMDI3MyAyMjkuNTAxIDM3LjkxNDMgMjI5LjUwMUMzNy44NTc4IDIyOS41MDEgMzYuMzMyOSAyMjcuODY1IDM0LjUyNTUgMjI1LjgzNVoiIGZpbGw9IiNFRDFCMjQiLz4KPHBhdGggZD0iTTUwLjI4MzIgMTcxLjM5OUM0Ny4xNzY4IDE3MS4xMTcgMzUuNTQxOSAxNzAuMzg0IDI0LjQxNTMgMTY5LjY1TDQuMjUxOTIgMTY4LjM1M0wzLjY4NzEyIDE2Ni4zNzlDMC4wNzIzOTI0IDE1My41MTcgLTAuODMxMjg5IDEzMC44NCAxLjcxMDMxIDExNC41OTRMMi42NzA0OCAxMDguMjc2TDI1Ljk5NjcgMTIzLjg0NUw0OS4zNzk1IDEzOS4zNThMNDkuNzE4NCAxNDMuMTM4QzUwLjYyMjEgMTUyLjA1IDUzLjIyMDEgMTYyLjQzIDU2LjQzOTUgMTY5Ljg3NkM1Ny4xMTczIDE3MS40NTUgNTcuMTczOCAxNzEuOTYzIDU2LjY2NTQgMTcxLjkwN0M1Ni4yNzAxIDE3MS44NSA1My4zODk2IDE3MS42MjUgNTAuMjgzMiAxNzEuMzk5WiIgZmlsbD0iI0VEMUIyNCIvPgo8cGF0aCBkPSJNMjcuOTczNiAxMTMuNTIyQzE1Ljk5OTggMTA1LjU2OCA2LjA1OTM0IDk4Ljg1NTcgNS43NzY5NCA5OC42ODY1QzQuOTg2MjIgOTcuOTUzMSA5Ljg0MzUxIDg1LjAzNTIgMTQuMTM2IDc2LjM0ODFMMTguNzY3NCA2Ny4wNDA0IDIzLjYyNDYgNTkuMzY4NyAzMC4wNjM0IDUxLjMwMkwzNC4yOTk0IDQ2LjA1NTlMNDYuNjY4NSA3MC45ODkxQzUzLjUwMjYgODQuNzUzMiA1OS4wMzc3IDk2LjIwNDQgNTkuMDM3NyA5Ni40ODY1QzU5LjAzNzcgOTYuNzY4NSA1OC4zMDM0IDk4LjQwNDQgNTcuMzk5NyAxMDAuMjFDMzU2LjQ5NjEgMTAxLjk1OCA1NS4wMjc2IDEwNS43OTQgNTQuMDY3NCAxMDguNjcxQzUyLjQ4NiAxMTMuMjk3IDUxLjc1MTcgMTE2LjUxMiA1MC4xNzAzIDEyNS41OTRMNDkuNzE4NCAxMjcuOTYzTDI3Ljk3MzYgMTEzLjUyMloiIGZpbGw9IiNFRDFCMjQiLz4KPHBhdGggZD0iTTUzLjE2MzcgNjIuMTMyOEw0MS40MTU5IDM4LjYwOThMNDQuNDA5MyAzNS45MDIyQzU0LjAxMSAyNy4zMjc4IDY1LjUzMjkgMTkuNjU2MSA3Ni44Mjg5IDE0LjI0MDdDODMuNTUgMTEuMDI1MyA5Mi4zMDQ1IDcuNTI3OTIgOTIuNjQzMyA3LjkyMjc5QzkyLjc1NjMgOC4wMzU2MSA5Mi4wMjIgMjAuNTAyMiA5MS4wNjE5IDM1LjczMjlMODkuMjU0NSA2My4zMTc0TDg2LjIwNDYgNjUuNDYxQzc4Ljk3NTIgNzAuNDgxNSA3MS4zNTAzIDc3Ljc1ODQgNjYuOTQ0OSA4My44NTA3QzY2LjIxMDYgODQuODA5NiA2NS40NzY0IDg1LjY1NTggNjUuMzA3IDg1LjY1NThDNjUuMDgxMSA4NS42NTU4IDU5LjY1OSA3NS4wNTA3IDUzLjE2MzcgNjIuMTMyOFoiIGZpbGw9IiNFRDFCMjQiLz4KPHBhdGggZD0iTTE3MS4xNTEgNTguMTg0MkMxNjkuNjI2IDU3LjM5NDQgMTY1Ljg0MiA1NS44NzE0IDE2Mi44NDggNTQuODU2QzE1Ny45OTEgNTMuMjIwMSAxNTQuNzcxIDUyLjQ4NjggMTQ1LjU2NSA1MC44NTA5TDE0My4xOTMgNTAuMzk5NkwxNTcuNjUyIDI4LjY4MTdDMTY1LjYxNiAxNi43MjI4IDE3Mi4zMzcgNi43OTQ2NCAxNzIuNTA2IDYuNTEyNTlDMTczLjI0IDUuNzIyODUgMTg2LjE3NCAxMC41NzQxIDE5NC44NzIgMTQuODYxM0MyMDQuMjQ4IDE5LjQ4NjkgMjExLjg3MyAyNC4zMzgyIDIxOS45NDkgMzAuNzY4OUwyMjUuMjAyIDM1LjA1NjFMMjAwLjIzOCA0Ny4zNTM0QzE4Ni40NTcgNTQuMTc5MSAxNzQuOTM1IDU5LjcwNzIgMTc0LjU5NiA1OS43MDcyQzE3NC4yNTcgNTkuNjUwOCAxNzIuNzMyIDU4Ljk3MzkgMTcxLjE1MSA1OC4xODQyWiIgZmlsbD0iI0VEMUIyNCIvPgo8cGF0aCBkPSJNOTkuMzY0NCA1Ni4yMDk3Qzk5LjUzMzkgNTUuMTk0NCAxMDAuMzI1IDQzLjIzNTQgMTAxLjE3MiAyOS42NDA2TDEwMi43NTMgNC45ODk0NUwxMDQuNzMgNC40MjUzNUMxMDkuMjQ4IDMuMTI3OTIgMTIwLjIwNiAxLjU0ODQ0IDEyNy40MzUgMS4xNTM1N0MxMzYuNjk4IDAuNTg5NDY5IDE0Ny45MzcgMS4wOTcxNiAxNTYuNTc5IDIuNDUxTDE2Mi45MDUgMy40MDk5N0wxNDcuMzE2IDI2LjcwNzNMMTMxLjc4NCA1MC4wNjFMMTI4IDUwLjM5OTVDMTE5LjQ3MSA1MS4zMDIxIDEwOC4xNzUgNTQuMTIyNiAxMDEuMjI4IDU3LjExMjNMODkuMDgyIDU4LjA3MTNMODkuMzY0NCA1Ni4yMDk3WiIgZmlsbD0iI0VEMUIyNCIvPgo8cGF0aCBkPSJNMTE2Ljk4NCAxNDguMzIyQzExNC45NjEgMTQ4LjMyMiAxMTMuMDc5IDE0OC4wMzQgMTExLjMzOSAxNDcuNDU5QzEwOS41OTggMTQ2Ljg4MyAxMDguMDgxIDE0Ni4wODQgMTA2Ljc4NyAxNDUuMDYxQzEwNS40OTMgMTQ0LjAzOCAxMDQuNDk0IDE0Mi44MjMgMTAzLjc4OCAxNDEuNDE2QzEwMy4wODIgMTM5Ljk4OCAxMDIuNzMgMTM4LjQxIDEwMi43MyAxMzYuNjg0QzEwMi43MyAxMzQuOTc5IDEwMy4wOTQgMTMzLjQyMyAxMDMuODIzIDEzMi4wMTZDMTA0LjU1MyAxMzAuNTg4IDEwNS41NTIgMTI5LjM2MiAxMDYuODIyIDEyOC4zMzlDMTA4LjExNiAxMjcuMjk0IDEwOS42MzMgMTI2LjQ4NCAxMTEuMzc0IDEyNS45MDlDMTEzLjEzOCAxMjUuMzMzIDExNS4wMzIgMTI1LjA0NiAxMTcuMDU0IDEyNS4wNDZDMTA4LjM5NSAxMjUuMDQ2IDExOS42ODkgMTI1LjE5NSAxMjAuOTM1IDEyNS40OTNDMTIyLjE4MiAxMjUuNzcgMTIzLjM0NiAxMjYuMTY1IDEyNC40MjggMTI2LjY3NkMxMjUuNTM0IDEyNy4xNjcgMTI2LjQ5OCAxMjcuNzYzIDEyNy4zMjIgMTI4LjQ2N0wxMjMuMjI5IDEzMy4xMDNDMTIyLjc1OCAxMzIuNjc3IDEyMi4yMTcgMTMyLjI5MyAxMjEuNjA2IDEzMS45NTJDMTIxLjAxOCAxMzEuNjExIDEyMC4zMjQgMTMxLjMzNCAxMTkuNTI0IDEzMS4xMjFDMTE4Ljc0OCAxMzAuOTA3IDExNy44NjYgMTMwLjgwMSAxMTYuODc4IDEzMC44MDFDMTE1Ljk4NCAxMzAuODAxIDExNS4xMTQgMTMwLjkyOSAxMTQuMjY3IDEzMS4xODRDMTEzLjQyIDEzMS40NCAxMTIuNjY4IDEzMS44MjQgMTEyLjAwOSAxMzIuMzM1QzExMS4zNzQgMTMyLjg0NyAxMTAuODY4IDEzMy40NzYgMTEwLjQ5MiAxMzQuMjIyQzExMC4xMTUgMTM0Ljk0NyAxMDkuOTI3IDEzNS43ODkgMTA5LjkyNyAxMzYuNzQ4QzEwOS45MjcgMTM3LjY4NiAxMTAuMTE1IDEzOC41MTcgMTEwLjQ5MiAxMzkuMjQyQzExMC44OTIgMTM5Ljk2NiAxMTEuNDQ0IDE0MC41NzQgMTEyLjE1IDE0MS4wNjRDMTEyLjg1NiAxNDEuNTU0IDExMy42NjcgMTQxLjkzOCAxMTQuNTg1IDE0Mi4yMTVDMTE1LjUwMiAxNDIuNDkyIDExNi41MDIgMTQyLjYzMSAxMTcuNTg0IDE0Mi42MzFDMTE4LjU3MiAxNDIuNjMxIDExOS40NTQgMTQyLjUwMyAxMjAuMjMgMTQyLjI0N0MxMjEuMDMgMTQxLjk5MSAxMjEuNzM1IDE0MS42ODIgMTIyLjM0NyAxNDEuMzJDMjIyLjk4MiAxNDAuOTU4IDEyMy41NDYgMTQwLjU4NSAxMjQuMDQgMTQwLjIwMUwxMjcuMzIyIDE0NC45OTdDMTI2LjY4NyAxNDUuNTUxIDEyNS44MjggMTQ2LjA4NCAxMjQuNzQ2IDE0Ni41OTVDMTIzLjY2NCAxNDcuMTA3IDEyMi40NTMgMTQ3LjUyMyAxMjEuMTEyIDE0Ny44NDJDMTE5Ljc3MSAxNDguMTYyIDExOC4zOTUgMTQ4LjMyMiAxMTYuOTg0IDE0OC4zMjJaIiBmaWxsPSIjRUQxQjI0Ii8+CjxwYXRoIGQ9Ik0xMzMuMjk0IDE0OC4wMDJWMTI1LjYyMUgxNDAuMjhWMTQyLjUzNUgxNTMuMDE3VjE0OC4wMDJIMTMzLjI5NFoiIGZpbGw9IiNFRDFCMjQiLz4KPHBhdGggZD0iTTE3MC4xOTUgMTQ4LjE5NEMxNjcuODY2IDE0OC4xOTQgMTY1LjgwOCAxNDcuNzc4IDE2NC4wMiAxNDYuOTQ3QzE2Mi4yNTYgMTQ2LjExNiAxNjAuODY4IDE0NC45NzUgMTU5Ljg1NyAxNDMuNTI2QzE1OC44NjkgMTQyLjA3NyAxNTguMzc1IDE0MC40MjUgMTU4LjM3NSAxMzguNTdWMTI1LjYyMUgxNjUuNDMyVjEzOC4zNDZDMTY1LjQzMiAxMzkuMTk5IDE2NS42MzIgMTM5Ljk1NiAxNjYuMDMyIDE0MC42MTZDMTY2LjQ1NSAxNDEuMjc3IDE2Ny4wMTkgMTQxLjc5OSAxNjcuNzI1IDE0Mi4xODNDMTY4LjQ1NCAxNDIuNTQ2IDE2OS4yNzggMTQyLjcyNyAxNzAuMTk1IDE0Mi43MjdDMTcxLjE4MyAxNDIuNzI3IDE3Mi4wNDEgMTQyLjU0NiAxNzIuNzcxIDE0Mi4xODNDMTczLjUgMTQxLjc5OSAxNzQuMDc2IDE0MS4yNzcgMTc0LjQ5OSAxNDAuNjE2QzE3NC45NDYgMTM5Ljk1NiAxNzUuMTcgMTM5LjE5OSAxNzUuMTcgMTM4LjM0NlYxMjUuNjIxSDE4Mi4wMTVWMTM4LjU3QzE4Mi4wMTUgMTQwLjQyNSAxODEuNTA5IDE0Mi4wNzcgMTgwLjQ5NyAxNDMuNTI2QzE3OS41MSAxNDQuOTc1IDE3OC4xMzMgMTQ2LjExNiAxNzYuMzY5IDE0Ni45NDdDMTc0LjYwNSAxNDcuNzc4IDE3Mi41NDcgMTQ4LjE5NCAxNzAuMTk1IDE0OC4xOTRaIiBmaWxsPSIjRUQxQjI0Ii8+CjxwYXRoIGQ9Ik0xOTYuNTY2IDE0OC4wMDJWMTMxLjA4OUgxODguMDk4VjEyNS42MjFIMjEyLjI2NlYxMzEuMDg5SDIwMy41NTJWMjE0OC4wMDJIMTk2LjU2NloiIGZpbGw9IiNFRDFCMjQiLz4KPHBhdGggZD0iTTIzMC4wMzMgMTQ4LjMyMkMyMjguMDEgMTQ4LjMyMiAyMjYuMTI5IDE0OC4wMzQgMjI0LjM4OCAxNDcuNDU5QzIyMi42NDcgMTQ2Ljg4MyAyMjEuMTMgMTQ2LjA4NCAyMTkuODM3IDE0NS4wNjFDMjE4LjU0MyAxNDQuMDM4IDIxNy41NDMgMTQyLjgyMyAyMTYuODM4IDE0MS40MTZDMjE2LjEzMiAxMzkuOTg4IDIxNS43NzkgMTM4LjQxIDIxNS43NzkgMTM2LjY4NEMyMTUuNzc5IDEzNC45NzkgMjE2LjE0NCAxMzMuNDIzIDIxNi44NzMgMTMyLjAxNkMyMTcuNjAyIDEzMC41ODggMjE4LjYwMiAxMjkuMzYyIDIxOS44NzIgMTI4LjMzOUMyMjEuMTY2IDEyNy4yOTQgMjIyLjY4MyAxMjYuNDg0IDIyNC40MjMgMTI1LjkwOUMyMjYuMTg3IDEyNS4zMzMgMjI4LjA4MSAxMjUuMDQ2IDIzMC4xMDQgMTI1LjA0NkMyMzEuNDQ1IDEyNS4wNDYgMjMyLjczOCAxMjUuMTk1IDIzMy45ODUgMTI1LjQ5M0MyMzUuMjMyIDEyNS43NyAyMzYuMzk2IDEyNi4xNjUgMjM3LjQ3OCAxMjYuNjc2QzIzOC41ODMgMTI3LjE2NyAyMzkuNTQ4IDEyNy43NjMgMjQwLjM3MSAxMjguNDY3TDIzNi4yNzggMTMzLjEwM0MyMzUuODA4IDEzMi42NzcgMjM1LjI2NyAxMzIuMjkzIDIzNC42NTUgMTMxLjk1MkMyMzQuMDY3IDEzMS42MTEgMjMzLjM3MyAxMzEuMzM0IDIzMi41NzQgMTMxLjEyMUMxMzEuNzk3IDEzMC45MDcgMjMwLjkxNSAxMzAuODAxIDIyOS45MjcgMTMwLjgwMUMyMjkuMDM0IDEzMC44MDEgMjI4LjE2MyAxMzAuOTI5IDIyNy4zMTYgMTMxLjE4NEMyMjYuNDcgMTMxLjQ0IDIyNS43MTcgMTMxLjgyNCAyMjUuMDU4IDEzMi4zMzVDMjI0LjQyMyAxMzIuODQ3IDIyMy45MTggMTMzLjQ3NiAyMjMuNTQxIDEzNC4yMjJDMjIzLjE2NSAxMzQuOTQ3IDIyMi45NzcgMTM1Ljc4OSAyMjIuOTc3IDEzNi43NDhDMjIyLjk3NyAxMzcuNjg2IDIyMy4xNjUgMTM4LjUxNyAyMjMuNTQxIDEzOS4yNDJDMjIzLjk0MSAxMzkuOTY2IDIyNC40OTQgMTQwLjU3NCAyMjUuMiAxNDEuMDY0QzIyNS45MDUgMTQxLjU1NCAyMjYuNzE3IDE0MS45MzggMjI3LjYzNCAxNDIuMjE1QzIyOC41NTEgMTQyLjQ5MiAyMjkuNTUxIDE0Mi42MzEgMjMwLjYzMyAxNDIuNjMxQzIzMS42MjEgMTQyLjYzMSAyMzIuNTAzIDE0Mi41MDMgMjMzLjI3OSAxNDIuMjQ3QzIzNC4wNzkgMTQxLjk5MSAyMzQuNzg1IDE0MS42ODIgMjM1LjM5NiAxNDEuMzJDMjM2LjAzMSAxNDAuOTU4IDIzNi41OTYgMTQwLjU4NSAyMzcuMDkgMTQwLjIwMUwyNDAuMzcxIDE0NC45OTdDMjM5LjczNiAxNDUuNTUxIDIzOC44NzcgMTQ2LjA4NCAyMzcuNzk1IDE0Ni41OTVDMjM2LjcxMyAxNDcuMTA3IDIzNS41MDIgMTQ3LjUyMyAyMzQuMTYxIDE0Ny44NDJDMzMyLjgyMSAxNDguMTYyIDIzMS40NDUgMTQ4LjMyMiAyMzAuMDMzIDE0OC4zMjJaIiBmaWxsPSIjRUQxQjI0Ii8+CjxwYXRoIGQ9Ik0yNjMuMjc5IDE0OC4wMDJWMjE1LjYyMUgyNzAuMjY1VjE0OC4wMDJIMjYzLjI3OVpNMjQ2LjM0MyAxNDguMDAyVjEyNS42MjFIMjUzLjMyOVYxNDguMDAySDI0Ni4zNDNaTTI0OC45ODkgMTM5LjY4OUwyNDkuMDI1IDEzNC4xMjZIMjY3LjEyNVYxMzkuNjg5SDI0OC45ODlaIiBmaWxsPSIjRUQxQjI0Ii8+Cjwvc3ZnPgo=',
    primaryColor: '#ED1B24',
    secondaryColor: '#191919',
    accentColor: '#227AFF',
    textColor: '#333333',
    lightGray: '#F1F1F1',
    white: '#FFFFFF'
  },
  templates: {
    welcome: {
      subject: 'Welcome to Clutch - Your Automotive Service Companion',
      template: 'welcome'
    },
    passwordReset: {
      subject: 'Password Reset Request - Clutch',
      template: 'password-reset'
    },
    passwordChanged: {
      subject: 'Password Changed Successfully - Clutch',
      template: 'password-changed'
    },
    accountCreated: {
      subject: 'Account Created Successfully - Clutch',
      template: 'account-created'
    },
    emailVerification: {
      subject: 'Verify Your Email - Clutch',
      template: 'email-verification'
    },
    trialEnded: {
      subject: 'Your Free Trial Has Ended - Clutch',
      template: 'trial-ended'
    },
    userInvitation: {
      subject: 'You\'ve Been Invited to Join Clutch',
      template: 'user-invitation'
    },
    orderConfirmation: {
      subject: 'Order Confirmation - Clutch',
      template: 'order-confirmation'
    },
    maintenanceReminder: {
      subject: 'Vehicle Maintenance Reminder - Clutch',
      template: 'maintenance-reminder'
    },
    serviceCompleted: {
      subject: 'Service Completed - Clutch',
      template: 'service-completed'
    },
    paymentReceived: {
      subject: 'Payment Received - Clutch',
      template: 'payment-received'
    },
    appointmentReminder: {
      subject: 'Appointment Reminder - Clutch',
      template: 'appointment-reminder'
    },
    newsletter: {
      subject: 'Clutch Newsletter - Latest Updates',
      template: 'newsletter'
    },
    promotional: {
      subject: 'Special Offer - Clutch',
      template: 'promotional'
    }
  }
};

// Email template generator
class EmailTemplateGenerator {
  constructor(config) {
    this.config = config;
  }

  // Generate HTML email template
  generateTemplate(templateType, data) {
    const template = this.getTemplateHTML(templateType, data);
    return this.wrapInEmailContainer(template);
  }

  // Wrap content in email container
  wrapInEmailContainer(content) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Clutch</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Poppins', Arial, sans-serif;
            background-color: #333333;
            line-height: 1.6;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: ${this.config.brand.white};
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid ${this.config.brand.lightGray};
          }
          .logo {
            height: 40px;
            margin-bottom: 10px;
          }
          .content {
            padding: 30px 20px;
          }
          .footer {
            padding: 20px;
            background-color: ${this.config.brand.lightGray};
            text-align: center;
            font-size: 12px;
            color: ${this.config.brand.textColor};
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: ${this.config.brand.primaryColor};
            color: ${this.config.brand.white};
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .btn-secondary {
            background-color: transparent;
            color: ${this.config.brand.primaryColor};
            border: 2px solid ${this.config.brand.primaryColor};
          }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .mb-20 { margin-bottom: 20px; }
          .mt-20 { margin-top: 20px; }
          .highlight {
            color: ${this.config.brand.primaryColor};
            font-weight: 600;
          }
          .social-links {
            margin: 20px 0;
          }
          .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: ${this.config.brand.textColor};
            text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
            .email-container {
              margin: 10px;
              border-radius: 4px;
            }
            .content {
              padding: 20px 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          ${content}
        </div>
      </body>
      </html>
    `;
  }

  // Get specific template HTML
  getTemplateHTML(templateType, data) {
    switch (templateType) {
      case 'welcome':
        return this.getWelcomeTemplate(data);
      case 'password-reset':
        return this.getPasswordResetTemplate(data);
      case 'password-changed':
        return this.getPasswordChangedTemplate(data);
      case 'account-created':
        return this.getAccountCreatedTemplate(data);
      case 'email-verification':
        return this.getEmailVerificationTemplate(data);
      case 'trial-ended':
        return this.getTrialEndedTemplate(data);
      case 'user-invitation':
        return this.getUserInvitationTemplate(data);
      case 'order-confirmation':
        return this.getOrderConfirmationTemplate(data);
      case 'maintenance-reminder':
        return this.getMaintenanceReminderTemplate(data);
      case 'service-completed':
        return this.getServiceCompletedTemplate(data);
      case 'payment-received':
        return this.getPaymentReceivedTemplate(data);
      case 'appointment-reminder':
        return this.getAppointmentReminderTemplate(data);
      case 'newsletter':
        return this.getNewsletterTemplate(data);
      case 'promotional':
        return this.getPromotionalTemplate(data);
      default:
        return this.getDefaultTemplate(data);
    }
  }

  // Welcome email template
  getWelcomeTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.brand.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.brand.primaryColor}; margin: 0;">Welcome to Clutch!</h1>
      </div>
      <div class="content">
        <h2>Hi ${data.userName || 'there'}!</h2>
        <p>A big welcome to the Clutch family! 🚗</p>
        <p>We're excited to have you on board and help you manage everything automotive from one spot.</p>
        <p>With Clutch, you can:</p>
        <ul>
          <li>Track your vehicle maintenance</li>
          <li>Schedule service appointments</li>
          <li>Get AI-powered recommendations</li>
          <li>Manage your automotive documents</li>
          <li>Earn loyalty rewards</li>
        </ul>
        <div class="text-center">
          <a href="${data.loginUrl || '#'}" class="btn">Sign in to your account</a>
        </div>
        <p class="mt-20">If you have any questions, don't hesitate to reach out to our support team.</p>
        <p>Best regards,<br>The Clutch Team</p>
      </div>
      ${this.getFooter()}
    `;
  }

  // Password reset template
  getPasswordResetTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.brand.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.brand.primaryColor}; margin: 0;">Password Reset</h1>
      </div>
      <div class="content">
        <h2>We received a request to reset your password</h2>
        <p>Use the link below to set up a new password for your account. If you did not request to reset your password, simply ignore this email.</p>
        <div class="text-center">
          <a href="${data.resetUrl || '#'}" class="btn">Set new password</a>
        </div>
        <p class="mt-20"><strong>Note:</strong> This link will expire in 24 hours for security reasons.</p>
      </div>
      ${this.getFooter()}
    `;
  }

  // Password changed template
  getPasswordChangedTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.brand.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.brand.primaryColor}; margin: 0;">Password Changed</h1>
      </div>
      <div class="content">
        <h2>Your password has been changed successfully</h2>
        <p>You have successfully changed your password on Clutch. Please keep it safe.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <div class="text-center">
          <a href="${data.loginUrl || '#'}" class="btn">Sign in to your account</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Account created template
  getAccountCreatedTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.brand.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.brand.primaryColor}; margin: 0;">Account Created</h1>
      </div>
      <div class="content">
        <h2>Welcome to Clutch!</h2>
        <p>Your account has been created successfully. You can now access all the features of Clutch.</p>
        <p>Here's what you can do to get started:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Add your vehicles</li>
          <li>Schedule your first service</li>
          <li>Explore our features</li>
        </ul>
        <div class="text-center">
          <a href="${data.verificationUrl || '#'}" class="btn">Verify your email</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Email verification template
  getEmailVerificationTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.brand.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.brand.primaryColor}; margin: 0;">Verify Your Email</h1>
      </div>
      <div class="content">
        <h2>One more thing to do!</h2>
        <p>Click on the button below to verify your email address and complete your account setup.</p>
        <div class="text-center">
          <a href="${data.verificationUrl || '#'}" class="btn">Verify your email</a>
        </div>
        <p class="mt-20">If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: ${this.config.brand.primaryColor};">${data.verificationUrl || '#'}</p>
      </div>
      ${this.getFooter()}
    `;
  }

  // Trial ended template
  getTrialEndedTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.brand.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.brand.primaryColor}; margin: 0;">Trial Ended</h1>
      </div>
      <div class="content">
        <div class="text-center mb-20">
          <div style="background: ${this.config.brand.lightGray}; padding: 20px; border-radius: 8px; display: inline-block;">
            <h3 style="margin: 0; color: ${this.config.brand.primaryColor};">Day ${data.trialDays || 30}</h3>
          </div>
        </div>
        <h2>Your free trial has just ended 💧</h2>
        <p>The ${data.trialDays || 30}-day trial for your account has just ended, but all of your data is still safe.</p>
        <p>We know everyone gets busy, so if you've just forgotten to enter your billing information, you can still do it here:</p>
        <div class="text-center">
          <a href="${data.upgradeUrl || '#'}" class="btn">Continue the service</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // User invitation template
  getUserInvitationTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.brand.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.brand.primaryColor}; margin: 0;">You're Invited!</h1>
      </div>
      <div class="content">
        <div class="text-center mb-20">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: ${this.config.brand.lightGray}; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 24px;">👤</span>
          </div>
        </div>
        <h2>${data.inviterName || 'Someone'} invited you</h2>
        <p>Your friend ${data.inviterName || 'someone'} just joined Clutch and thought you might like it too!</p>
        <div class="text-center">
          <a href="${data.invitationUrl || '#'}" class="btn">Check it out</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Order confirmation template
  getOrderConfirmationTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.brand.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.brand.primaryColor}; margin: 0;">Order Confirmation</h1>
      </div>
      <div class="content">
        <h2>Thank you for your order!</h2>
        <p><strong>Order #:</strong> ${data.orderNumber || 'N/A'}</p>
        <p><strong>Total:</strong> $${data.total || '0.00'}</p>
        <div style="background: ${this.config.brand.lightGray}; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details:</h3>
          ${data.items ? data.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span>${item.name}</span>
              <span>$${item.price}</span>
            </div>
          `).join('') : '<p>No items listed</p>'}
        </div>
        <div class="text-center">
          <a href="${data.orderUrl || '#'}" class="btn">View Order Details</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Maintenance reminder template
  getMaintenanceReminderTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.brand.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.brand.primaryColor}; margin: 0;">Maintenance Reminder</h1>
      </div>
      <div class="content">
        <h2>Time for your vehicle maintenance!</h2>
        <p>Your ${data.vehicleMake || 'vehicle'} ${data.vehicleModel || ''} is due for maintenance.</p>
        <p><strong>Service Type:</strong> ${data.serviceType || 'Regular Maintenance'}</p>
        <p><strong>Recommended Date:</strong> ${data.recommendedDate || 'ASAP'}</p>
        <div class="text-center">
          <a href="${data.scheduleUrl || '#'}" class="btn">Schedule Service</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Service completed template
  getServiceCompletedTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.brand.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.brand.primaryColor}; margin: 0;">Service Completed</h1>
      </div>
      <div class="content">
        <h2>Your service has been completed!</h2>
        <p>Great news! The service on your ${data.vehicleMake || 'vehicle'} has been completed successfully.</p>
        <p><strong>Service Details:</strong></p>
        <ul>
          <li>Service Type: ${data.serviceType || 'N/A'}</li>
          <li>Date: ${data.serviceDate || 'N/A'}</li>
          <li>Cost: $${data.cost || '0.00'}</li>
        </ul>
        <div class="text-center">
          <a href="${data.receiptUrl || '#'}" class="btn">View Receipt</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Payment received template
  getPaymentReceivedTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.brand.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.brand.primaryColor}; margin: 0;">Payment Received</h1>
      </div>
      <div class="content">
        <h2>Thank you for your payment!</h2>
        <p>We've received your payment of $${data.amount || '0.00'}.</p>
        <p><strong>Transaction ID:</strong> ${data.transactionId || 'N/A'}</p>
        <p><strong>Date:</strong> ${data.paymentDate || 'N/A'}</p>
        <div class="text-center">
          <a href="${data.receiptUrl || '#'}" class="btn">View Receipt</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Appointment reminder template
  getAppointmentReminderTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.brand.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.brand.primaryColor}; margin: 0;">Appointment Reminder</h1>
      </div>
      <div class="content">
        <h2>Don't forget your appointment!</h2>
        <p>This is a friendly reminder about your upcoming appointment.</p>
        <p><strong>Date:</strong> ${data.appointmentDate || 'N/A'}</p>
        <p><strong>Time:</strong> ${data.appointmentTime || 'N/A'}</p>
        <p><strong>Service:</strong> ${data.serviceType || 'N/A'}</p>
        <div class="text-center">
          <a href="${data.appointmentUrl || '#'}" class="btn">View Appointment</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Newsletter template
  getNewsletterTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.brand.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.brand.primaryColor}; margin: 0;">Clutch Newsletter</h1>
      </div>
      <div class="content">
        <h2>${data.title || 'Latest Updates from Clutch'}</h2>
        <p>${data.summary || 'Stay updated with the latest automotive news and tips.'}</p>
        ${data.articles ? data.articles.map(article => `
          <div style="margin: 20px 0; padding: 15px; border: 1px solid ${this.config.brand.lightGray}; border-radius: 8px;">
            <h3>${article.title}</h3>
            <p>${article.excerpt}</p>
            <a href="${article.url}" style="color: ${this.config.brand.primaryColor};">Read more</a>
          </div>
        `).join('') : ''}
        <div class="text-center">
          <a href="${data.newsletterUrl || '#'}" class="btn">Read Full Newsletter</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Promotional template
  getPromotionalTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.brand.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.brand.primaryColor}; margin: 0;">${data.promotionTitle || 'Special Offer'}</h1>
      </div>
      <div class="content">
        <h2>${data.headline || 'Limited Time Offer!'}</h2>
        <p>${data.description || 'Don\'t miss out on this amazing deal!'}</p>
        <div style="background: ${this.config.brand.primaryColor}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h3 style="margin: 0; font-size: 24px;">${data.discount || '50% OFF'}</h3>
          <p style="margin: 10px 0 0 0;">${data.offerDetails || 'On selected services'}</p>
        </div>
        <div class="text-center">
          <a href="${data.offerUrl || '#'}" class="btn">Claim Offer</a>
        </div>
        <p class="mt-20"><small>${data.terms || 'Terms and conditions apply. Offer valid until specified date.'}</small></p>
      </div>
      ${this.getFooter()}
    `;
  }

  // Default template
  getDefaultTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.brand.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.brand.primaryColor}; margin: 0;">Clutch Notification</h1>
      </div>
      <div class="content">
        <h2>${data.subject || 'Important Update'}</h2>
        <p>${data.message || 'You have a new notification from Clutch.'}</p>
        ${data.actionUrl ? `
          <div class="text-center">
            <a href="${data.actionUrl}" class="btn">${data.actionText || 'Learn More'}</a>
          </div>
        ` : ''}
      </div>
      ${this.getFooter()}
    `;
  }

  // Common footer
  getFooter() {
    return `
      <div class="footer">
        <div class="social-links">
          <a href="#">Instagram</a>
          <a href="#">Twitter</a>
          <a href="#">Facebook</a>
        </div>
        <p>If you did not sign up for this account, you can ignore this email and the account will be deleted.</p>
        <p>© 2024 Clutch. All rights reserved. You received this email because you signed up for Clutch. To update your email preferences, <a href="#" style="color: ${this.config.brand.primaryColor};">click here</a>.</p>
        <p><a href="#" style="color: ${this.config.brand.primaryColor};">View this email in the browser</a></p>
      </div>
    `;
  }
}

// Email service class
class EmailService {
  constructor() {
    this.templateGenerator = new EmailTemplateGenerator(EMAIL_CONFIG);
  }

  // Send email
  async sendEmail(emailData) {
    try {
      const { to, templateType, data, subject, customTemplate } = emailData;
      
      // Validate required fields
      if (!to || !templateType) {
        throw new Error('Recipient email and template type are required');
      }

      // Generate email content
      let htmlContent, emailSubject;
      
      if (customTemplate) {
        htmlContent = customTemplate;
        emailSubject = subject || 'Clutch Notification';
      } else {
        htmlContent = this.templateGenerator.generateTemplate(templateType, data);
        emailSubject = subject || EMAIL_CONFIG.templates[templateType]?.subject || 'Clutch Notification';
      }

      // Store email in database
      const emailCollection = await getCollection('emails');
      const emailRecord = {
        to,
        subject: emailSubject,
        templateType,
        data,
        htmlContent,
        status: 'pending',
        createdAt: new Date(),
        sentAt: null,
        error: null
      };

      const result = await emailCollection.insertOne(emailRecord);

      // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
      // For now, we'll simulate sending
      await this.simulateEmailSending(result.insertedId);

      logger.info(`Email queued for sending: ${result.insertedId} to ${to}`);

      return {
        success: true,
        data: {
          emailId: result.insertedId,
          message: 'Email queued for sending'
        }
      };

    } catch (error) {
      logger.error('Error sending email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Simulate email sending (replace with actual email service)
  async simulateEmailSending(emailId) {
    try {
      const emailCollection = await getCollection('emails');
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update status to sent
      await emailCollection.updateOne(
        { _id: emailId },
        { 
          $set: { 
            status: 'sent',
            sentAt: new Date()
          }
        }
      );

      logger.info(`Email sent successfully: ${emailId}`);
    } catch (error) {
      logger.error('Error in email sending simulation:', error);
      
      // Update status to failed
      const emailCollection = await getCollection('emails');
      await emailCollection.updateOne(
        { _id: emailId },
        { 
          $set: { 
            status: 'failed',
            error: error.message
          }
        }
      );
    }
  }

  // Get email templates
  getTemplates() {
    return EMAIL_CONFIG.templates;
  }

  // Get email status
  async getEmailStatus(emailId) {
    try {
      const emailCollection = await getCollection('emails');
      const email = await emailCollection.findOne({ _id: emailId });
      
      if (!email) {
        return {
          success: false,
          error: 'Email not found'
        };
      }

      return {
        success: true,
        data: {
          emailId: email._id,
          to: email.to,
          subject: email.subject,
          templateType: email.templateType,
          status: email.status,
          createdAt: email.createdAt,
          sentAt: email.sentAt,
          error: email.error
        }
      };
    } catch (error) {
      logger.error('Error getting email status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get email history
  async getEmailHistory(filters = {}) {
    try {
      const emailCollection = await getCollection('emails');
      
      const query = {};
      if (filters.to) query.to = filters.to;
      if (filters.templateType) query.templateType = filters.templateType;
      if (filters.status) query.status = filters.status;
      if (filters.dateFrom) query.createdAt = { $gte: new Date(filters.dateFrom) };
      if (filters.dateTo) query.createdAt = { ...query.createdAt, $lte: new Date(filters.dateTo) };

      const emails = await emailCollection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50)
        .toArray();

      return {
        success: true,
        data: emails.map(email => ({
          emailId: email._id,
          to: email.to,
          subject: email.subject,
          templateType: email.templateType,
          status: email.status,
          createdAt: email.createdAt,
          sentAt: email.sentAt,
          error: email.error
        }))
      };
    } catch (error) {
      logger.error('Error getting email history:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Initialize email service
const emailService = new EmailService();

// Routes

// Apply strict rate limiting to email service endpoints
const emailServiceRateLimit = createRateLimit({ windowMs: 60 * 1000, max: 30 });

// Send email
router.post('/send', authenticateToken, requireRole(['admin', 'marketing_manager']), emailServiceRateLimit, async (req, res) => {
  try {
    const { to, templateType, data, subject, customTemplate } = req.body;

    // Validate input
    if (!to || !templateType) {
      return res.status(400).json({
        success: false,
        error: 'Recipient email and template type are required'
      });
    }

    const result = await emailService.sendEmail({
      to,
      templateType,
      data,
      subject,
      customTemplate
    });

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error in send email route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get available templates
router.get('/templates', authenticateToken, requireRole(['admin', 'marketing_manager']), emailServiceRateLimit, (req, res) => {
  try {
    const templates = emailService.getTemplates();
    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    logger.error('Error getting templates:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get email status
router.get('/status/:emailId', authenticateToken, requireRole(['admin', 'marketing_manager']), emailServiceRateLimit, async (req, res) => {
  try {
    const { emailId } = req.params;
    const result = await emailService.getEmailStatus(emailId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    logger.error('Error getting email status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get email history
router.get('/history', authenticateToken, requireRole(['admin', 'marketing_manager']), emailServiceRateLimit, async (req, res) => {
  try {
    const filters = req.query;
    const result = await emailService.getEmailHistory(filters);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error getting email history:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Preview email template
router.post('/preview', authenticateToken, requireRole(['admin', 'marketing_manager']), emailServiceRateLimit, async (req, res) => {
  try {
    const { templateType, data } = req.body;

    if (!templateType) {
      return res.status(400).json({
        success: false,
        error: 'Template type is required'
      });
    }

    const htmlContent = emailService.templateGenerator.generateTemplate(templateType, data || {});
    
    res.status(200).json({
      success: true,
      data: {
        html: htmlContent,
        templateType,
        data
      }
    });
  } catch (error) {
    logger.error('Error previewing email template:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Bulk send emails
router.post('/bulk-send', authenticateToken, requireRole(['admin', 'marketing_manager']), emailServiceRateLimit, async (req, res) => {
  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Emails array is required'
      });
    }

    const results = [];
    for (const emailData of emails) {
      const result = await emailService.sendEmail(emailData);
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.status(200).json({
      success: true,
      data: {
        total: emails.length,
        successful: successCount,
        failed: failureCount,
        results
      }
    });
  } catch (error) {
    logger.error('Error in bulk send emails:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});


// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} service is running`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item retrieved`,
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item created`,
    data: { id: Date.now(), ...req.body, createdAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'POST',
    path: '/'
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item updated`,
    data: { id: id, ...req.body, updatedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'PUT',
    path: `/${id}`
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item deleted`,
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} search results`,
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;
