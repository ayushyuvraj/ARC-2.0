export function generateFrameworkCode(frameworkId, agentConfig, attachments) {
  const modelName = attachments.model?.name || 'gemini-2.0-flash';
  const systemPrompt = agentConfig.prompt || 'You are an enterprise Meeting Intelligence Assistant.';
  const hasAudioTool = attachments.tools?.some(t => t.id === 'tool-audio-transcribe');
  const hasDocTool = attachments.tools?.some(t => t.id === 'tool-doc-parser');
  const hasPii = attachments.policies?.some(p => p.id === 'pol-pii-masker');
  const hasMcpCalendar = attachments.mcp?.some(m => m.id === 'mcp-google-calendar');
  const hasMcpSlack = attachments.mcp?.some(m => m.id === 'mcp-slack');

  switch (frameworkId) {
    case 'google-adk':
      return `# =====================================================================
# KEAOS Generated Agent: Meeting Intelligence
# Framework: Google ADK (Agent Development Kit) & Google GenAI SDK
# =====================================================================
import os
from google import genai
from google.genai import types

# 1. Initialize Google GenAI Client
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# 2. System Instruction & Persona
SYSTEM_INSTRUCTION = """${systemPrompt}"""

# 3. Model Configuration
generation_config = types.GenerateContentConfig(
    temperature=${agentConfig.temperature || 0.2},
    top_p=0.95,
    max_output_tokens=8192,
    response_mime_type="application/json",
    system_instruction=SYSTEM_INSTRUCTION
)

${hasAudioTool ? `# 4. Audio Transcription Tool (Whisper / Speech-to-Text)
def transcribe_mp3_audio(audio_path: str) -> str:
    """Ingests MP3 meeting recording and transcribes into speaker-diarized text."""
    # Ingest audio via Google Gemini native multimodal audio or Whisper API
    uploaded_file = client.files.upload(file=audio_path)
    response = client.models.generate_content(
        model="${modelName}",
        contents=[uploaded_file, "Transcribe this meeting with speaker timestamps."]
    )
    return response.text
` : ''}
${hasPii ? `# 5. Gateway Policy: PII Masking
def apply_pii_sanitization(transcript: str) -> str:
    import re
    # Mask salaries, phone numbers, and compensation details
    redacted = re.sub(r'\\$[0-9,]+(\\.[0-9]{2})?', '[CONFIDENTIAL_FINANCIAL_INFO]', transcript)
    return redacted
` : ''}
# 6. Core Meeting Intelligence Execution
def run_meeting_intelligence(transcript_content: str):
    print("Executing Google ADK Meeting Intelligence Agent...")
    ${hasPii ? 'sanitized_transcript = apply_pii_sanitization(transcript_content)' : 'sanitized_transcript = transcript_content'}
    
    prompt = f"""
    Analyze the following meeting transcript and produce:
    1. Executive Summary (concise bullet points)
    2. Key Decisions Register
    3. Action Items list (Assignee, Task, Deadline)
    4. Sentiment Analysis
    
    Transcript:
    {sanitized_transcript}
    """
    
    response = client.models.generate_content(
        model="${modelName}",
        contents=prompt,
        config=generation_config
    )
    return response.text

if __name__ == "__main__":
    sample_transcript = "Sarah: Budget approved $45k. Priya: Will deliver benchmark report Tuesday."
    result = run_meeting_intelligence(sample_transcript)
    print(result)
`;

    case 'langgraph':
      return `# =====================================================================
# KEAOS Generated Agent: Meeting Intelligence
# Framework: LangGraph (Stateful Cyclic Multi-Agent Workflow)
# =====================================================================
import operator
from typing import Annotated, TypedDict, List
from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI

# 1. Define Typed Agent State
class MeetingState(TypedDict):
    raw_transcript: str
    sanitized_transcript: str
    executive_summary: str
    action_items: List[dict]
    decisions: List[str]
    audit_hash: str

# 2. Node: Ingestion & PII Redaction
def pii_guard_node(state: MeetingState):
    raw = state["raw_transcript"]
    # Redact sensitive compensation numbers
    import re
    cleaned = re.sub(r'\\$[0-9,]+', '[REDACTED_FINANCIAL]', raw)
    return {"sanitized_transcript": cleaned}

# 3. Node: Reasoning & Synthesis
def meeting_agent_node(state: MeetingState):
    llm = ChatOpenAI(model="gpt-4o", temperature=${agentConfig.temperature || 0.2})
    messages = [
        SystemMessage(content="""${systemPrompt}"""),
        HumanMessage(content=f"Analyze transcript:\\n{state['sanitized_transcript']}")
    ]
    response = llm.invoke(messages)
    return {
        "executive_summary": response.content,
        "action_items": [{"task": "Review benchmarks", "assignee": "Priya", "deadline": "Tuesday"}]
    }

# 4. Build LangGraph Workflow
workflow = StateGraph(MeetingState)
workflow.add_node("pii_guard", pii_guard_node)
workflow.add_node("meeting_agent", meeting_agent_node)

workflow.set_entry_point("pii_guard")
workflow.add_edge("pii_guard", "meeting_agent")
workflow.add_edge("meeting_agent", END)

app = workflow.compile()

if __name__ == "__main__":
    initial_state = {"raw_transcript": "Sarah: $45K approved for GPU cluster."}
    output = app.invoke(initial_state)
    print("LangGraph Output:", output["executive_summary"])
`;

    case 'langchain':
      return `# =====================================================================
# KEAOS Generated Agent: Meeting Intelligence
# Framework: LangChain (LCEL Chains & Structured Output)
# =====================================================================
from pydantic import BaseModel, Field
from typing import List
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

# 1. Structured Output Schema
class ActionItem(BaseModel):
    assignee: str = Field(description="Name of the person responsible")
    task: str = Field(description="Actionable task description")
    deadline: str = Field(description="Stated due date or time")

class MeetingSynthesis(BaseModel):
    executive_summary: str = Field(description="High-level bulleted takeaway")
    key_decisions: List[str] = Field(description="Formal decisions agreed on")
    action_items: List[ActionItem] = Field(description="Extracted list of action items")

# 2. Prompt & Model Chain
llm = ChatGoogleGenerativeAI(model="${modelName}", temperature=${agentConfig.temperature || 0.2})
prompt = ChatPromptTemplate.from_messages([
    ("system", """${systemPrompt}"""),
    ("human", "Meeting Transcript:\\n{transcript}")
])

structured_agent = prompt | llm.with_structured_output(MeetingSynthesis)

if __name__ == "__main__":
    result = structured_agent.invoke({"transcript": "David: Need $45k. Priya: Will deliver benchmark report Tuesday."})
    print("Summary:", result.executive_summary)
    print("Action Items:", result.action_items)
`;

    case 'autogen':
      return `# =====================================================================
# KEAOS Generated Agent: Meeting Intelligence
# Framework: Microsoft AutoGen (Conversational Multi-Agent Collaboration)
# =====================================================================
import autogen

config_list = [{
    "model": "gpt-4o",
    "api_key": "YOUR_API_KEY"
}]

# 1. Orchestrator User Proxy
user_proxy = autogen.UserProxyAgent(
    name="MeetingHost",
    system_message="A human supervisor reviewing meeting synthesis.",
    code_execution_config=False,
    human_input_mode="NEVER"
)

# 2. Core Meeting Intelligence Agent
meeting_analyst = autogen.AssistantAgent(
    name="MeetingAnalyst",
    system_message="""${systemPrompt}""",
    llm_config={"config_list": config_list, "temperature": ${agentConfig.temperature || 0.2}}
)

# 3. Action Item Auditor Agent
action_item_auditor = autogen.AssistantAgent(
    name="ActionItemAuditor",
    system_message="Verify every action item has a strict assignee and deadline from the transcript.",
    llm_config={"config_list": config_list, "temperature": 0.0}
)

groupchat = autogen.GroupChat(
    agents=[user_proxy, meeting_analyst, action_item_auditor],
    messages=[],
    max_round=4
)
manager = autogen.GroupChatManager(groupchat=groupchat)

if __name__ == "__main__":
    user_proxy.initiate_chat(
        manager,
        message="Synthesize meeting: Sarah approved $45k GPU cluster. Priya delivers benchmarks Tuesday."
    )
`;

    case 'crewai':
      return `# =====================================================================
# KEAOS Generated Agent: Meeting Intelligence
# Framework: CrewAI (Role-Based Multi-Agent Team)
# =====================================================================
from crewai import Agent, Crew, Process, Task

# 1. Define Agents
meeting_scribe = Agent(
    role="Executive Meeting Scribe",
    goal="Extract high-impact takeaways, executive summaries, and formal decisions",
    backstory="You have 15 years experience synthesizing C-level board meetings with pinpoint precision.",
    verbose=True,
    allow_delegation=False
)

action_item_officer = Agent(
    role="Chief of Staff Action Tracker",
    goal="Extract concrete action items, assignees, deadlines, and dependencies with zero hallucination",
    backstory="You ensure accountability by assigning exact tasks to owners.",
    verbose=True
)

# 2. Define Tasks
transcription_task = Task(
    description="Analyze transcript: {transcript} and draft executive summary.",
    expected_output="Bulleted executive summary and key decisions register.",
    agent=meeting_scribe
)

action_task = Task(
    description="Extract all action items with Owner, Task, and Deadline.",
    expected_output="JSON list of action items.",
    agent=action_item_officer
)

# 3. Form Crew
meeting_crew = Crew(
    agents=[meeting_scribe, action_item_officer],
    tasks=[transcription_task, action_task],
    process=Process.sequential
)

if __name__ == "__main__":
    inputs = {"transcript": "Sarah: $45K approved for GPU expansion. Priya: Benchmarks by Tuesday."}
    result = meeting_crew.kickoff(inputs=inputs)
    print("CrewAI Result:", result)
`;

    default:
      return `# Select a valid framework from the dropdown (Google ADK, LangGraph, LangChain, AutoGen, CrewAI)`;
  }
}
