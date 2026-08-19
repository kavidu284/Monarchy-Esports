from pydantic import BaseModel

class TournamentCreate(BaseModel):
    title: str
    description: str
    game_name: str
    prize_pool: float
    start_date: str
    registration_open: bool
    max_teams: int
class RoundRobinStatusUpdate(BaseModel):
    completed: bool

class BracketStatusUpdate(BaseModel):
    published: bool


class PublishStatusUpdate(BaseModel):
    published: bool